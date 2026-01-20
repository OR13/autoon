# Autoon

Opinionated profiles of popular JSON based media types for use with AI via the [TOON format](https://github.com/toon-format/toon).

## Media Types

Autoon uses `application/autoon` as the base media type with a `profile` parameter to indicate the specific JSON format being represented.
JSON based media types are sometimes very flexible, autoon profiles are designed to make them as strict and deterministic as possible, while remaining valid when translated back to their original JSON based media type.

| Use Case | Defacto Standard Media Type | Proposed Autoon Media Type |
|----------|----------------------------|--------------------------|

| Data Representation | `application/json` | `application/autoon;profile="https://autoon.dev/profiles/json-instance"` |
| Data Validation | `application/schema+json` | `application/autoon;profile="https://autoon.dev/profiles/json-schema"` |
| API Definition | `application/openapi+json` | `application/autoon;profile="https://autoon.dev/profiles/openapi"` |
| RDF Representation | `application/ld+json` | `application/autoon;profile="https://autoon.dev/profiles/json-ld"` |
| Geographic Representation | `application/geo+json` | `application/autoon;profile="https://autoon.dev/profiles/geojson"` |
| Interface Definition | `application/json` | `application/autoon;profile="https://autoon.dev/profiles/json-render"` |
| Workflow Representation | `application/json` | `application/autoon;profile="https://autoon.dev/profiles/json-workflow"` |

### References

- **Data Representation**
  - [ECMA-404 JSON Standard](https://www.ecma-international.org/publications-and-standards/standards/ecma-404/)
  - [RFC 8259: JSON Data Interchange Format](https://datatracker.ietf.org/doc/html/rfc8259)

- **Data Validation**
  - [JSON Schema Specification](https://json-schema.org/)
  - [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
  - [IETF Draft: application/schema+json](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema)

- **Interface Definition**
  - [Vercel AI SDK UI](https://sdk.vercel.ai/docs)
  - [vercel-labs/json-render](https://github.com/vercel-labs/json-render)

- **Workflow Representation**
  - [ComfyUI Workflow JSON Spec](https://docs.comfy.org/specs/workflow_json)
  - [LiteGraph.js](https://github.com/jagenjo/litegraph.js)
  - [ComfyUI](https://github.com/comfyanonymous/ComfyUI)

- **API Definition**
  - [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
  - [OpenAPI Initiative](https://www.openapis.org/)

- **RDF Representation**
  - [JSON-LD Specification](https://json-ld.org/spec/latest/json-ld/)
  - [W3C JSON-LD 1.1](https://www.w3.org/TR/json-ld11/)

- **Geographic Representation**
  - [RFC 7946: GeoJSON Format](https://datatracker.ietf.org/doc/html/rfc7946)
  - [GeoJSON.org](https://geojson.org/)


## Quick Start

### Web UI

```bash
cd web
bun install
bun run dev
```

Open http://localhost:3000

### CLI

Work in progress...

```bash
# Install dependencies
bun install

# Initialize a new autoon file
bun run src/cli/index.ts init my-workflow.json

# Validate an autoon file
bun run src/cli/index.ts validate my-workflow.json

# Generate example graphs
bun run src/cli/index.ts generate --type process

# Export to DOT format for Graphviz
bun run src/cli/index.ts visualize my-workflow.json --format dot
```

## Development

```bash
# Install all dependencies
bun install
cd web && bun install

# Run CLI in watch mode
bun run dev

# Run web UI in dev mode
bun run dev:web

# Build everything
bun run build
```

## Deployment

The web UI is designed for static hosting (GitHub Pages, Vercel, etc.):

```bash
cd web
bun run build
# Static files are in web/out/
```

## License

MIT
