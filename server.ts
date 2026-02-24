import type { ServeOptions, Server } from 'bun'
import path from 'node:path'

const SERVER_PORT = Number(process.env.PORT ?? 3000)
console.log(`[DEBUG] process.env.PORT = "${process.env.PORT}"`)
console.log(`[DEBUG] Using port = ${SERVER_PORT}`)
const CLIENT_DIRECTORY = './dist/client'
const SERVER_ENTRY_POINT = './dist/server/server.js'

const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  success: (message: string) => console.log(`[SUCCESS] ${message}`),
  warning: (message: string) => console.log(`[WARNING] ${message}`),
  error: (message: string) => console.log(`[ERROR] ${message}`),
  header: (message: string) => console.log(`\n${message}\n`),
};

const MAX_PRELOAD_BYTES = Number(process.env.ASSET_PRELOAD_MAX_SIZE ?? 5 * 1024 * 1024)

const INCLUDE_PATTERNS = (process.env.ASSET_PRELOAD_INCLUDE_PATTERNS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pattern: string) => convertGlobToRegExp(pattern))

const EXCLUDE_PATTERNS = (process.env.ASSET_PRELOAD_EXCLUDE_PATTERNS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((pattern: string) => convertGlobToRegExp(pattern))

const ENABLE_ETAG = (process.env.ASSET_PRELOAD_ENABLE_ETAG ?? 'true') === 'true'
const ENABLE_GZIP = (process.env.ASSET_PRELOAD_ENABLE_GZIP ?? 'true') === 'true'
const GZIP_MIN_BYTES = Number(process.env.ASSET_PRELOAD_GZIP_MIN_SIZE ?? 1024)
const GZIP_TYPES = (
  process.env.ASSET_PRELOAD_GZIP_MIME_TYPES ??
  'text/,application/javascript,application/json,application/xml,image/svg+xml'
)
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean)

function convertGlobToRegExp(globPattern: string): RegExp {
  const escapedPattern = globPattern
    .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
    .replace(/\*/g, '.*')
  return new RegExp(`^${escapedPattern}$`, 'i')
}

function computeEtag(data: Uint8Array): string {
  const hash = Bun.hash(data)
  return `W/"${hash.toString(16)}-${data.byteLength.toString()}"`
}

interface AssetMetadata {
  route: string
  size: number
  type: string
}

interface InMemoryAsset {
  raw: Uint8Array
  gz?: Uint8Array
  etag?: string
  type: string
  immutable: boolean
  size: number
}

interface PreloadResult {
  routes: Record<string, (req: Request) => Response | Promise<Response>>
  loaded: AssetMetadata[]
  skipped: AssetMetadata[]
}

function isFileEligibleForPreloading(relativePath: string): boolean {
  const fileName = relativePath.split(/[/\\]/).pop() ?? relativePath
  if (INCLUDE_PATTERNS.length > 0) {
    if (!INCLUDE_PATTERNS.some((pattern) => pattern.test(fileName))) {
      return false
    }
  }
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(fileName))) {
    return false
  }
  return true
}

function isMimeTypeCompressible(mimeType: string): boolean {
  return GZIP_TYPES.some((type) =>
    type.endsWith('/') ? mimeType.startsWith(type) : mimeType === type,
  )
}

function compressDataIfAppropriate(
  data: Uint8Array,
  mimeType: string,
): Uint8Array | undefined {
  if (!ENABLE_GZIP) return undefined
  if (data.byteLength < GZIP_MIN_BYTES) return undefined
  if (!isMimeTypeCompressible(mimeType)) return undefined
  try {
    return Bun.gzipSync(data.buffer as ArrayBuffer)
  } catch {
    return undefined
  }
}

function createResponseHandler(asset: InMemoryAsset): (req: Request) => Response {
  return (req: Request) => {
    const headers: Record<string, string> = {
      'Content-Type': asset.type,
      'Cache-Control': asset.immutable
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600',
    }

    if (ENABLE_ETAG && asset.etag) {
      const ifNone = req.headers.get('if-none-match')
      if (ifNone && ifNone === asset.etag) {
        return new Response(null, { status: 304, headers: { ETag: asset.etag } })
      }
      headers.ETag = asset.etag
    }

    if (ENABLE_GZIP && asset.gz && req.headers.get('accept-encoding')?.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip'
      headers['Content-Length'] = String(asset.gz.byteLength)
      return new Response(new Uint8Array(asset.gz), { status: 200, headers })
    }

    headers['Content-Length'] = String(asset.raw.byteLength)
    return new Response(new Uint8Array(asset.raw), { status: 200, headers })
  }
}

function createCompositeGlobPattern(): InstanceType<typeof Bun.Glob> {
  const raw = (process.env.ASSET_PRELOAD_INCLUDE_PATTERNS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (raw.length === 0) return new Bun.Glob('**/*')
  if (raw.length === 1) return new Bun.Glob(raw[0])
  return new Bun.Glob(`{${raw.join(',')}}`)
}

async function initializeStaticRoutes(clientDirectory: string): Promise<PreloadResult> {
  const routes: Record<string, (req: Request) => Response | Promise<Response>> = {}
  const loaded: AssetMetadata[] = []
  const skipped: AssetMetadata[] = []

  log.info(`Loading static assets from ${clientDirectory}...`)

  let totalPreloadedBytes = 0

  try {
    const glob = createCompositeGlobPattern()
    for await (const relativePath of glob.scan({ cwd: clientDirectory })) {
      const filepath = path.join(clientDirectory, relativePath)
      const route = `/${relativePath.split(path.sep).join(path.posix.sep)}`

      try {
        const file = Bun.file(filepath)
        if (!(await file.exists()) || file.size === 0) continue

        const metadata: AssetMetadata = {
          route,
          size: file.size,
          type: file.type || 'application/octet-stream',
        }

        const matchesPattern = isFileEligibleForPreloading(relativePath)
        const withinSizeLimit = file.size <= MAX_PRELOAD_BYTES

        if (matchesPattern && withinSizeLimit) {
          const bytes = new Uint8Array(await file.arrayBuffer())
          const gz = compressDataIfAppropriate(bytes, metadata.type)
          const etag = ENABLE_ETAG ? computeEtag(bytes) : undefined
          const asset: InMemoryAsset = {
            raw: bytes,
            gz,
            etag,
            type: metadata.type,
            immutable: true,
            size: bytes.byteLength,
          }
          routes[route] = createResponseHandler(asset)
          loaded.push({ ...metadata, size: bytes.byteLength })
          totalPreloadedBytes += bytes.byteLength
        } else {
          routes[route] = () => {
            const fileOnDemand = Bun.file(filepath)
            return new Response(fileOnDemand, {
              headers: {
                'Content-Type': metadata.type,
                'Cache-Control': 'public, max-age=3600',
              },
            })
          }
          skipped.push(metadata)
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'EISDIR') {
          log.error(`Failed to load ${filepath}: ${(error as Error).message}`)
        }
      }
    }

    console.log()
    if (loaded.length > 0) {
      log.success(`Preloaded ${String(loaded.length)} files (${(totalPreloadedBytes / 1024 / 1024).toFixed(2)} MB) into memory`)
    }
    if (skipped.length > 0) {
      log.info(`${String(skipped.length)} files will be served on-demand`)
    }
  } catch (error) {
    log.error(`Failed to load static files from ${clientDirectory}: ${String(error)}`)
  }

  return { routes, loaded, skipped }
}

async function initializeServer() {
  log.header('Starting Production Server')

  let handler: { fetch: (request: Request) => Response | Promise<Response> }
  try {
    const serverModule = (await import(SERVER_ENTRY_POINT)) as {
      default: { fetch: (request: Request) => Response | Promise<Response> }
    }
    handler = serverModule.default
    log.success('TanStack Start application handler initialized')
  } catch (error) {
    log.error(`Failed to load server handler: ${String(error)}`)
    process.exit(1)
  }

  const { routes } = await initializeStaticRoutes(CLIENT_DIRECTORY)

  const server = Bun.serve({
    port: SERVER_PORT,
    routes: {
      ...routes,
      '/*': (req: Request) => {
        try {
          return handler.fetch(req)
        } catch (error) {
          log.error(`Server handler error: ${String(error)}`)
          return new Response('Internal Server Error', { status: 500 })
        }
      },
    },
    error(error: Error) {
      log.error(`Uncaught server error: ${error.message}`)
      return new Response('Internal Server Error', { status: 500 })
    },
  } as unknown as ServeOptions) as Server

  log.success(`Server listening on http://localhost:${String(server.port)}`)
}

initializeServer().catch((error: unknown) => {
  log.error(`Failed to start server: ${String(error)}`)
  process.exit(1)
})
