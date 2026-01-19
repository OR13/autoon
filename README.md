# Autoon

Model class, instance, process and workflow using [TOON format](https://github.com/toon-format/toon) and [JSON Graph Specification](https://github.com/jsongraph/json-graph-specification).

![Autoon Screenshot](./docs/screenshot.png)

## Features

- **TOON Format**: Compact, human-readable, schema-aware JSON for LLM prompts
- **JSON Graph Spec v2**: Standard format for nodes, edges, and hyperedges
- **Visual Node Editor**: LiteGraph-powered drag-and-drop graph editing
- **Code Editor**: CodeMirror 6 with syntax highlighting
- **URL Sharing**: Compress and share graphs via URL fragments
- **CLI Tools**: Generate, validate, and visualize from command line

## Graph Types

- **Class**: UML-style class diagrams with attributes, methods, inheritance
- **Instance**: Object instance diagrams
- **Process**: Flowcharts with actions, decisions, states
- **Workflow**: Activity diagrams with fork/join parallelism

## Quick Start

### Web UI

```bash
cd web
bun install
bun run dev
```

Open http://localhost:3000

### CLI

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

## TOON Format Example

```
graph{id,type,label,directed}:
  login-process,process,Login Process,true

nodes[6]{id,label,type}:
  start,Start,start
  enterCreds,Enter Credentials,action
  validate,Valid?,decision
  success,Login Success,state
  failure,Login Failed,state
  end,End,end

edges[6]{source,target,relation,label}:
  start,enterCreds,flows,
  enterCreds,validate,flows,
  validate,success,guards,yes
  validate,failure,guards,no
  success,end,flows,
  failure,enterCreds,flows,
```

## JSON Graph Format

```json
{
  "graph": {
    "id": "login-process",
    "type": "process",
    "label": "Login Process",
    "directed": true,
    "nodes": {
      "start": { "label": "Start", "type": "start" },
      "enterCreds": { "label": "Enter Credentials", "type": "action" },
      "validate": { "label": "Valid?", "type": "decision" },
      "success": { "label": "Login Success", "type": "state" },
      "failure": { "label": "Login Failed", "type": "state" },
      "end": { "label": "End", "type": "end" }
    },
    "edges": [
      { "source": "start", "target": "enterCreds", "relation": "flows" },
      { "source": "enterCreds", "target": "validate", "relation": "flows" },
      { "source": "validate", "target": "success", "relation": "guards", "label": "yes" },
      { "source": "validate", "target": "failure", "relation": "guards", "label": "no" },
      { "source": "success", "target": "end", "relation": "flows" },
      { "source": "failure", "target": "enterCreds", "relation": "flows" }
    ]
  }
}
```

## Project Structure

```
autoon/
├── src/
│   ├── cli/           # CLI commands
│   ├── core/          # Core logic (validation, conversion)
│   ├── schemas/       # JSON schemas
│   └── web/           # Browser utilities
├── web/               # Next.js web application
│   ├── src/
│   │   ├── app/       # Next.js app router
│   │   ├── components/ # React components
│   │   ├── lib/       # Utilities
│   │   └── types/     # TypeScript types
│   └── out/           # Static export (after build)
└── package.json
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

### Content Negotiation Example

```http
# Request Autoon format
Accept: application/autoon;profile="https://autoon.dev/profiles/json-schema"

# Response
Content-Type: application/autoon;profile="https://autoon.dev/profiles/json-schema"

graph{id,type,label}:
  person-schema,schema,Person Schema

nodes[4]{id,label,type,dataType}:
  root,Person,object,
  firstName,firstName,property,string
  lastName,lastName,property,string
  age,age,property,integer
```

### Profile URLs

Each profile URL defines:
- The expected structure of the Autoon document
- Conversion rules to/from the standard JSON format
- Validation constraints specific to that format

### Demo Pages

- [JSON Schema](/json-schema) - Model JSON Schema definitions
- [JSON Instance](/json-instance) - Model JSON data instances
- [JSON Render](/json-render) - Model UI components for AI-generated interfaces
- [LiteGraph](/litegraph) - Model ComfyUI/LiteGraph workflows

## License

MIT
