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

## License

MIT
