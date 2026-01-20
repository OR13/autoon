#!/usr/bin/env bun
/**
 * Autoon CLI
 * Model class, instance, process and workflow using TOON + JSON Graph
 */

import { parseArgs } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { encode as toonEncode, decode as toonDecode } from '@toon-format/toon';
import { validateAutoon } from '../core/validator.js';
import { jsonToToon, toonToJson } from '../core/converter.js';
import type { AutoonDocument, Graph } from '../core/types.js';

const VERSION = '0.1.0';

const HELP = `
  ╔═══════════════════════════════════════════════════════════════╗
  ║                         AUTOON CLI                            ║
  ║   Model class, instance, process & workflow with TOON format  ║
  ╚═══════════════════════════════════════════════════════════════╝

  Usage: autoon <command> [options] [file]

  Commands:
    init [dir]          Initialize a new Autoon project with examples
    generate <file>     Generate TOON from JSON or JSON from TOON
    validate <file>     Validate an Autoon document
    visualize <file>    Generate visualization data (DOT format)
    help                Show this help message

  Options:
    -o, --output <file>   Output file path
    -f, --format <fmt>    Output format (toon, json, dot)
    -t, --type <type>     Graph type filter (class, instance, process, workflow)
    -v, --version         Show version
    -h, --help            Show help

  Examples:
    autoon init my-project
    autoon generate model.json -o model.toon
    autoon validate workflow.toon
    autoon visualize process.json -f dot > process.dot

  Documentation: https://github.com/YOUR_USERNAME/autoon
`;

const EXAMPLES = {
  class: {
    graph: {
      id: 'user-model',
      type: 'class' as const,
      label: 'User Management Classes',
      directed: true,
      nodes: {
        User: { label: 'User', type: 'class' as const },
        id: { label: 'id: string', type: 'attribute' as const },
        email: { label: 'email: string', type: 'attribute' as const },
        role: { label: 'role: Role', type: 'attribute' as const },
        login: { label: 'login()', type: 'method' as const },
        Role: { label: 'Role', type: 'class' as const },
        Admin: { label: 'Admin', type: 'class' as const }
      },
      edges: [
        { source: 'User', target: 'id', relation: 'has' as const },
        { source: 'User', target: 'email', relation: 'has' as const },
        { source: 'User', target: 'role', relation: 'has' as const },
        { source: 'User', target: 'login', relation: 'has' as const },
        { source: 'User', target: 'Role', relation: 'uses' as const },
        { source: 'Admin', target: 'User', relation: 'inherits' as const }
      ],
      metadata: {
        description: 'Example class diagram for user management',
        version: '1.0.0',
        tags: ['user', 'auth', 'example']
      }
    }
  },
  instance: {
    graph: {
      id: 'user-instances',
      type: 'instance' as const,
      label: 'User Instances',
      directed: true,
      nodes: {
        alice: { label: 'alice: User', type: 'instance' as const },
        bob: { label: 'bob: User', type: 'instance' as const },
        adminRole: { label: 'admin: Role', type: 'instance' as const }
      },
      edges: [
        { source: 'alice', target: 'adminRole', relation: 'has' as const, label: 'role' }
      ],
      metadata: {
        description: 'Example instance diagram'
      }
    }
  },
  process: {
    graph: {
      id: 'login-process',
      type: 'process' as const,
      label: 'Login Process',
      directed: true,
      nodes: {
        start: { label: 'Start', type: 'start' as const },
        enterCreds: { label: 'Enter Credentials', type: 'action' as const },
        validate: { label: 'Valid?', type: 'decision' as const },
        success: { label: 'Login Success', type: 'state' as const },
        failure: { label: 'Login Failed', type: 'state' as const },
        end: { label: 'End', type: 'end' as const }
      },
      edges: [
        { source: 'start', target: 'enterCreds', relation: 'flows' as const },
        { source: 'enterCreds', target: 'validate', relation: 'flows' as const },
        { source: 'validate', target: 'success', relation: 'guards' as const, label: 'yes' },
        { source: 'validate', target: 'failure', relation: 'guards' as const, label: 'no' },
        { source: 'success', target: 'end', relation: 'flows' as const },
        { source: 'failure', target: 'enterCreds', relation: 'flows' as const }
      ],
      metadata: {
        description: 'User login process flow'
      }
    }
  },
  workflow: {
    graph: {
      id: 'order-workflow',
      type: 'workflow' as const,
      label: 'Order Processing Workflow',
      directed: true,
      nodes: {
        start: { label: 'Order Received', type: 'start' as const },
        fork1: { label: 'Fork', type: 'fork' as const },
        payment: { label: 'Process Payment', type: 'action' as const },
        inventory: { label: 'Check Inventory', type: 'action' as const },
        join1: { label: 'Join', type: 'join' as const },
        ship: { label: 'Ship Order', type: 'action' as const },
        end: { label: 'Complete', type: 'end' as const }
      },
      edges: [
        { source: 'start', target: 'fork1', relation: 'flows' as const },
        { source: 'fork1', target: 'payment', relation: 'flows' as const },
        { source: 'fork1', target: 'inventory', relation: 'flows' as const },
        { source: 'payment', target: 'join1', relation: 'flows' as const },
        { source: 'inventory', target: 'join1', relation: 'flows' as const },
        { source: 'join1', target: 'ship', relation: 'flows' as const },
        { source: 'ship', target: 'end', relation: 'flows' as const }
      ],
      metadata: {
        description: 'Parallel order processing workflow'
      }
    }
  }
};

function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f' },
      type: { type: 'string', short: 't' },
      version: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' }
    },
    allowPositionals: true
  });

  if (values.version) {
    console.log(`autoon v${VERSION}`);
    return;
  }

  if (values.help || positionals.length === 0) {
    console.log(HELP);
    return;
  }

  const command = positionals[0];
  const arg = positionals[1];

  switch (command) {
    case 'init':
      cmdInit(arg || '.');
      break;
    case 'generate':
    case 'gen':
    case 'g':
      if (!arg) {
        console.error('Error: Please provide a file to convert');
        process.exit(1);
      }
      cmdGenerate(arg, values.output, values.format);
      break;
    case 'validate':
    case 'val':
    case 'v':
      if (!arg) {
        console.error('Error: Please provide a file to validate');
        process.exit(1);
      }
      cmdValidate(arg, values.type);
      break;
    case 'visualize':
    case 'viz':
      if (!arg) {
        console.error('Error: Please provide a file to visualize');
        process.exit(1);
      }
      cmdVisualize(arg, values.output, values.format);
      break;
    case 'help':
      console.log(HELP);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

function cmdInit(dir: string) {
  const projectDir = dir === '.' ? process.cwd() : join(process.cwd(), dir);
  
  console.log(`\n  📁 Initializing Autoon project in ${projectDir}\n`);
  
  // Create directories
  const dirs = ['models', 'models/class', 'models/instance', 'models/process', 'models/workflow'];
  for (const d of dirs) {
    const fullPath = join(projectDir, d);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }
  
  // Create example files
  for (const [type, doc] of Object.entries(EXAMPLES)) {
    const jsonPath = join(projectDir, 'models', type, `example.json`);
    const toonPath = join(projectDir, 'models', type, `example.toon`);
    
    writeFileSync(jsonPath, JSON.stringify(doc, null, 2));
    writeFileSync(toonPath, jsonToToon(doc));
    
    console.log(`  ✓ Created ${type}/example.json`);
    console.log(`  ✓ Created ${type}/example.toon`);
  }
  
  // Create README
  const readme = `# Autoon Project

This project uses [Autoon](https://github.com/YOUR_USERNAME/autoon) for modeling.

## Structure

- \`models/class/\` - Class diagrams
- \`models/instance/\` - Instance diagrams  
- \`models/process/\` - Process/state diagrams
- \`models/workflow/\` - Workflow diagrams

## Commands

\`\`\`bash
# Generate TOON from JSON
autoon generate models/class/example.json -o output.toon

# Validate a model
autoon validate models/workflow/example.toon

# Generate DOT visualization
autoon visualize models/process/example.json -f dot
\`\`\`
`;
  
  writeFileSync(join(projectDir, 'README.md'), readme);
  console.log(`  ✓ Created README.md`);
  
  console.log(`\n  ✨ Project initialized! Try: autoon validate models/class/example.toon\n`);
}

/**
 * Check if a JSON object is an Autoon graph document
 */
function isAutoonDocument(obj: unknown): obj is AutoonDocument {
  if (typeof obj !== 'object' || obj === null) return false;
  const doc = obj as Record<string, unknown>;
  return 'graph' in doc || 'graphs' in doc;
}

function cmdGenerate(file: string, output?: string, format?: string) {
  if (!existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }

  const content = readFileSync(file, 'utf-8');
  const ext = extname(file).toLowerCase();

  let result: string;
  let outExt: string;

  // Auto-detect input format
  if (ext === '.json' || content.trim().startsWith('{') || content.trim().startsWith('[')) {
    // JSON to TOON
    const parsed = JSON.parse(content);

    // Check if it's an Autoon graph document or generic JSON
    if (isAutoonDocument(parsed)) {
      // Autoon document - validate and use custom converter
      const validation = validateAutoon(parsed);
      if (!validation.valid) {
        console.error('Validation errors:');
        validation.errors?.forEach(e => console.error(`  - ${e.path}: ${e.message}`));
        process.exit(1);
      }

      if (format === 'json') {
        result = JSON.stringify(parsed, null, 2);
        outExt = '.json';
      } else {
        result = jsonToToon(parsed);
        outExt = '.toon';
      }
    } else {
      // Generic JSON - use @toon-format/toon library
      if (format === 'json') {
        result = JSON.stringify(parsed, null, 2);
        outExt = '.json';
      } else {
        result = toonEncode(parsed);
        outExt = '.toon';
      }
    }
  } else {
    // TOON to JSON - try to decode with @toon-format/toon first
    let decoded: unknown;
    try {
      decoded = toonDecode(content);
    } catch {
      // Fall back to custom Autoon TOON parser
      decoded = toonToJson(content);
    }

    if (format === 'toon') {
      result = toonEncode(decoded);
      outExt = '.toon';
    } else {
      result = JSON.stringify(decoded, null, 2);
      outExt = '.json';
    }
  }

  if (output) {
    writeFileSync(output, result);
    console.log(`✓ Generated: ${output}`);
  } else {
    console.log(result);
  }
}

function cmdValidate(file: string, type?: string) {
  if (!existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }
  
  const content = readFileSync(file, 'utf-8');
  const ext = extname(file).toLowerCase();
  
  let doc: AutoonDocument;
  
  if (ext === '.json' || content.trim().startsWith('{')) {
    doc = JSON.parse(content);
  } else {
    doc = toonToJson(content);
  }
  
  const validation = validateAutoon(doc);
  
  if (validation.valid) {
    const graph = doc.graph || doc.graphs?.[0];
    console.log(`\n  ✅ Valid Autoon document`);
    console.log(`     Type: ${graph?.type || 'unknown'}`);
    console.log(`     Nodes: ${Object.keys(graph?.nodes || {}).length}`);
    console.log(`     Edges: ${graph?.edges?.length || 0}\n`);
    
    // Check type filter
    if (type && graph?.type !== type) {
      console.log(`  ⚠️  Warning: Expected type "${type}" but found "${graph?.type}"\n`);
    }
  } else {
    console.error(`\n  ❌ Invalid Autoon document\n`);
    validation.errors?.forEach(e => {
      console.error(`     ${e.path}: ${e.message}`);
    });
    console.log('');
    process.exit(1);
  }
}

function cmdVisualize(file: string, output?: string, format?: string) {
  if (!existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    process.exit(1);
  }
  
  const content = readFileSync(file, 'utf-8');
  const ext = extname(file).toLowerCase();
  
  let doc: AutoonDocument;
  
  if (ext === '.json' || content.trim().startsWith('{')) {
    doc = JSON.parse(content);
  } else {
    doc = toonToJson(content);
  }
  
  const graph = doc.graph || doc.graphs?.[0];
  if (!graph) {
    console.error('Error: No graph found in document');
    process.exit(1);
  }
  
  // Generate DOT format
  const dot = graphToDot(graph);
  
  if (output) {
    writeFileSync(output, dot);
    console.log(`✓ Generated: ${output}`);
  } else {
    console.log(dot);
  }
}

function graphToDot(graph: Graph): string {
  const lines: string[] = [];
  const directed = graph.directed !== false;
  const graphType = directed ? 'digraph' : 'graph';
  const edgeOp = directed ? '->' : '--';
  
  lines.push(`${graphType} "${graph.id || 'autoon'}" {`);
  lines.push('  rankdir=TB;');
  lines.push('  node [fontname="Helvetica", fontsize=11];');
  lines.push('  edge [fontname="Helvetica", fontsize=10];');
  lines.push('');
  
  // Node styling based on type
  const nodeStyles: Record<string, string> = {
    class: 'shape=box, style=filled, fillcolor="#e3f2fd"',
    attribute: 'shape=ellipse, style=filled, fillcolor="#fff3e0"',
    method: 'shape=ellipse, style=filled, fillcolor="#f3e5f5"',
    instance: 'shape=box, style="filled,rounded", fillcolor="#e8f5e9"',
    state: 'shape=box, style="filled,rounded", fillcolor="#fce4ec"',
    action: 'shape=box, style=filled, fillcolor="#e0f7fa"',
    decision: 'shape=diamond, style=filled, fillcolor="#fff9c4"',
    start: 'shape=circle, style=filled, fillcolor="#c8e6c9", width=0.3',
    end: 'shape=doublecircle, style=filled, fillcolor="#ffcdd2", width=0.3',
    fork: 'shape=rect, style=filled, fillcolor="#424242", width=1, height=0.1',
    join: 'shape=rect, style=filled, fillcolor="#424242", width=1, height=0.1'
  };
  
  // Output nodes
  for (const [id, node] of Object.entries(graph.nodes)) {
    const style = nodeStyles[node.type || ''] || 'shape=box';
    const label = node.label || id;
    lines.push(`  "${id}" [label="${label}", ${style}];`);
  }
  
  lines.push('');
  
  // Output edges
  if (graph.edges) {
    for (const edge of graph.edges) {
      const attrs: string[] = [];
      if (edge.label) attrs.push(`label="${edge.label}"`);
      if (edge.relation) attrs.push(`tooltip="${edge.relation}"`);
      
      const attrStr = attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
      lines.push(`  "${edge.source}" ${edgeOp} "${edge.target}"${attrStr};`);
    }
  }
  
  lines.push('}');
  
  return lines.join('\n');
}

main();
