# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autoon models workflows and data structures using TOON format (compact, human-readable JSON) and JSON Graph Specification v2. It supports four graph types: class diagrams, instance diagrams, process flows, and workflows.

## Development Commands

### Root Level (Bun runtime)
```bash
bun install              # Install CLI dependencies
bun run dev              # Watch CLI in development mode
bun run dev:web          # Start Next.js dev server (localhost:3000)
bun run build            # Build both CLI and web
bun run build:cli        # Build CLI only to dist/cli
bun run build:web        # Build web only (static export)
bun test                 # Run tests
```

### Web UI (cd web/)
```bash
bun install              # Install web dependencies
bun run dev              # Next.js dev server
bun run build            # Static build to web/out/
bun run lint             # ESLint checks
```

### CLI Usage
```bash
bun run src/cli/index.ts init <file>           # Create new autoon file
bun run src/cli/index.ts validate <file>       # Validate autoon file
bun run src/cli/index.ts generate --type <type> # Generate example (class/instance/process/workflow)
bun run src/cli/index.ts visualize <file> --format dot  # Export to DOT format
```

## Architecture

**Dual-stack application:**
- `src/` - CLI and core library (Bun runtime, ESNext modules)
- `web/` - Next.js 16 web application (React 19, static export)

**Core modules (src/core/):**
- `types.ts` - TypeScript type definitions for graphs, nodes, edges
- `validator.ts` - AJV-based JSON Schema validation
- `converter.ts` - TOON ↔ JSON bidirectional conversion

**Web components (web/src/components/):**
- `CodeEditor.tsx` - CodeMirror 6 wrapper with TOON syntax highlighting
- `GraphEditor.tsx` - LiteGraph.js wrapper for visual node editing
- `UseCasePage.tsx` - Reusable page template for demo pages

**Key libraries:**
- @toon-format/toon - TOON format parsing/serialization
- AJV - JSON Schema validation
- CodeMirror 6 - Code editor with custom TOON language support (`web/src/lib/toon-language.ts`)
- LiteGraph.js - Node-based visual programming interface
- Flowbite React + TailwindCSS 4 - UI components

## Graph Types and Node/Edge Relations

| Type | Node Types | Edge Relations |
|------|------------|----------------|
| class | class, attribute, method | inherits, implements, has, uses, creates |
| instance | instance | (values) |
| process | state, action, decision, start, end | transitions, triggers |
| workflow | state, action, decision, start, end, fork, join | flows, guards |

## TOON Format

Compact representation with header rows defining columns:
```
graph{id,type,label,directed}:
  login-process,process,Login Process,true

nodes[3]{id,label,type}:
  start,Start,start
  action,Validate,action
  end,End,end

edges[2]{source,target,relation,label}:
  start,action,flows,
  action,end,flows,
```

## Static Deployment

Web UI exports to static files for GitHub Pages/Vercel:
```bash
cd web && bun run build   # Output in web/out/
```
