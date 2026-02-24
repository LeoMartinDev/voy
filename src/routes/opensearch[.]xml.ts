import { createFileRoute } from "@tanstack/react-router";
import { config } from "@/server/config";

const OPENSEARCH_HEADERS = {
	"Content-Type": "application/opensearchdescription+xml; charset=utf-8",
	"Cache-Control": "public, max-age=86400",
} as const;

export const Route = createFileRoute("/opensearch.xml")({
	server: {
		handlers: {
			HEAD: () => {
				return new Response(null, {
					status: 200,
					headers: OPENSEARCH_HEADERS,
				});
			},
			GET: () => {
				const { name, url: baseUrl } = config.instance;
				const url = baseUrl.replace(/\/$/, "");

				const xml = `<?xml version="1.0" encoding="utf-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
	<ShortName>${name}</ShortName>
	<Description>Private metasearch engine</Description>
	<InputEncoding>UTF-8</InputEncoding>
	<OutputEncoding>UTF-8</OutputEncoding>
	<Image width="16" height="16" type="image/svg+xml">${url}/favicon.svg</Image>
	<Url type="text/html" method="get" template="${url}/search?q={searchTerms}"/>
	<Url type="application/x-suggestions+json" rel="suggestions" method="get" template="${url}/api/suggest?q={searchTerms}"/>
	<Url type="application/opensearchdescription+xml" rel="self" template="${url}/opensearch.xml" />
	<Query role="example" searchTerms="${name}" />
</OpenSearchDescription>`;

				return new Response(xml.trim(), {
					status: 200,
					headers: OPENSEARCH_HEADERS,
				});
			},
		},
	},
});
