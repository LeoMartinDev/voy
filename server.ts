import path from 'node:path'
import {
  createRequestContext,
  withRequestIdHeader,
} from './src/server/infrastructure/logging/request-context'
import {
  getServerLogger,
  withLogContext,
} from './src/server/infrastructure/logging/logger'

const SERVER_PORT = Number(process.env.PORT ?? 3000)
const CLIENT_DIRECTORY = './dist/client'
const SERVER_ENTRY_POINT = './dist/server/server.js'

const logger = withLogContext({
  logger: getServerLogger(),
  bindings: {
    component: 'production-server',
  },
})

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
  const staticAssetsLogger = withLogContext({
    logger,
    bindings: {
      component: 'static-assets',
    },
  })

  staticAssetsLogger.info(
    {
      event: 'static_assets.preload.started',
      clientDirectory,
      maxPreloadBytes: MAX_PRELOAD_BYTES,
    },
    'Loading static assets',
  )

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
          staticAssetsLogger.error(
            {
              event: 'static_assets.preload.file_failed',
              filepath,
              err: error,
            },
            'Failed to preload static asset',
          )
        }
      }
    }

    if (loaded.length > 0) {
      staticAssetsLogger.info(
        {
          event: 'static_assets.preload.completed',
          loadedCount: loaded.length,
          totalPreloadedBytes,
          totalPreloadedMB: Number((totalPreloadedBytes / 1024 / 1024).toFixed(2)),
        },
        'Static assets preloaded in memory',
      )
    }
    if (skipped.length > 0) {
      staticAssetsLogger.info(
        {
          event: 'static_assets.preload.partial',
          skippedCount: skipped.length,
        },
        'Some assets will be served on-demand',
      )
    }
  } catch (error) {
    staticAssetsLogger.error(
      {
        event: 'static_assets.preload.failed',
        clientDirectory,
        err: error,
      },
      'Failed to initialize static routes',
    )
  }

  return { routes, loaded, skipped }
}

async function initializeServer() {
  logger.info(
    {
      event: 'server.starting',
      port: SERVER_PORT,
      configuredPort: process.env.PORT ?? null,
    },
    'Starting production server',
  )

  let handler: { fetch: (request: Request) => Response | Promise<Response> }
  try {
    const serverModule = (await import(SERVER_ENTRY_POINT)) as {
      default: { fetch: (request: Request) => Response | Promise<Response> }
    }
    handler = serverModule.default
    logger.info(
      {
        event: 'server.handler.initialized',
      },
      'TanStack Start handler initialized',
    )
  } catch (error) {
    logger.error(
      {
        event: 'server.handler.initialization_failed',
        err: error,
      },
      'Failed to load server handler',
    )
    process.exit(1)
  }

  const { routes } = await initializeStaticRoutes(CLIENT_DIRECTORY)

  const server = Bun.serve({
    port: SERVER_PORT,
    routes: {
      ...routes,
      '/*': async (req: Request) => {
        const startedAt = performance.now()
        const requestContext = createRequestContext({
          request: req,
          logger,
          operation: 'http.request',
        })

        try {
          const response = await handler.fetch(req)
          const durationMs = Math.round(performance.now() - startedAt)

          requestContext.logger.info(
            {
              event: 'http.request.completed',
              status: response.status,
              durationMs,
            },
            'Request completed',
          )

          return withRequestIdHeader({
            response,
            requestId: requestContext.requestId,
          })
        } catch (error) {
          const durationMs = Math.round(performance.now() - startedAt)

          requestContext.logger.error(
            {
              event: 'http.request.failed',
              status: 500,
              durationMs,
              err: error,
            },
            'Unhandled request failure',
          )

          return withRequestIdHeader({
            response: new Response('Internal Server Error', { status: 500 }),
            requestId: requestContext.requestId,
          })
        }
      },
    },
    error(error: Error) {
      logger.error(
        {
          event: 'server.uncaught_error',
          err: error,
        },
        'Uncaught server error',
      )
      return new Response('Internal Server Error', { status: 500 })
    },
  })

  logger.info(
    {
      event: 'server.started',
      port: server.port,
    },
    'Server listening',
  )
}

initializeServer().catch((error: unknown) => {
  logger.error(
    {
      event: 'server.start_failed',
      err: error,
    },
    'Server failed to start',
  )
  process.exit(1)
})
