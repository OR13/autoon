import { AutoonDocument, AutoonGraph } from '@/types/autoon';

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseValue(value: string): string | boolean | number | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return undefined;
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  return value;
}

function escapeValue(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function toonToJson(toon: string): AutoonDocument {
  const lines = toon.split('\n').map((l) => l.trimEnd());
  const doc: AutoonDocument = {};

  let currentSection: string | null = null;
  const graph: AutoonGraph = { type: 'class', nodes: {} };
  let fields: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    const graphMatch = line.match(/^graph\{([^}]+)\}:$/);
    const nodesMatch = line.match(/^nodes\[(\d+)\]\{([^}]+)\}:$/);
    const edgesMatch = line.match(/^edges\[(\d+)\]\{([^}]+)\}:$/);
    const metadataMatch = line.match(/^metadata:$/);

    if (graphMatch) {
      currentSection = 'graph';
      fields = graphMatch[1].split(',').map((f) => f.trim());
      continue;
    }
    if (nodesMatch) {
      currentSection = 'nodes';
      fields = nodesMatch[2].split(',').map((f) => f.trim());
      continue;
    }
    if (edgesMatch) {
      currentSection = 'edges';
      fields = edgesMatch[2].split(',').map((f) => f.trim());
      graph.edges = graph.edges || [];
      continue;
    }
    if (metadataMatch) {
      currentSection = 'metadata';
      graph.metadata = graph.metadata || {};
      continue;
    }

    if (line.startsWith('  ')) {
      const data = line.substring(2);
      const values = parseCSVLine(data);

      if (currentSection === 'graph') {
        fields.forEach((field, idx) => {
          const val = parseValue(values[idx] || '');
          if (val !== undefined) {
            if (field === 'directed') {
              (graph as unknown as Record<string, unknown>)[field] = val === true || val === 'true';
            } else {
              (graph as unknown as Record<string, unknown>)[field] = val;
            }
          }
        });
      }

      if (currentSection === 'nodes') {
        const idIdx = fields.indexOf('id');
        const nodeId = values[idIdx] || 'node_' + Object.keys(graph.nodes).length;
        const node: Record<string, unknown> = {};
        fields.forEach((field, idx) => {
          if (field !== 'id' && values[idx]) {
            node[field] = values[idx];
          }
        });
        graph.nodes[nodeId] = node;
      }

      if (currentSection === 'edges') {
        const edge: Record<string, unknown> = {};
        fields.forEach((field, idx) => {
          if (values[idx]) edge[field] = values[idx];
        });
        if (edge.source && edge.target) {
          graph.edges!.push(edge as { source: string; target: string });
        }
      }

      if (currentSection === 'metadata') {
        const colonIdx = data.indexOf(':');
        if (colonIdx > 0) {
          graph.metadata![data.substring(0, colonIdx).trim()] = data.substring(colonIdx + 1).trim();
        }
      }
    }
  }

  doc.graph = graph;
  return doc;
}

export function jsonToToon(doc: AutoonDocument): string {
  const lines: string[] = [];
  const g = doc.graph || (doc.graphs && doc.graphs[0]);
  if (!g) return '';

  lines.push('graph{id,type,label,directed}:');
  lines.push(`  ${g.id || ''},${g.type},${escapeValue(g.label || '')},${g.directed !== false}`);
  lines.push('');

  const nodeCount = Object.keys(g.nodes || {}).length;
  if (nodeCount > 0) {
    lines.push(`nodes[${nodeCount}]{id,label,type}:`);
    for (const id in g.nodes) {
      const node = g.nodes[id];
      lines.push(`  ${id},${escapeValue(node.label || '')},${node.type || ''}`);
    }
    lines.push('');
  }

  const edgeCount = g.edges ? g.edges.length : 0;
  if (edgeCount > 0) {
    lines.push(`edges[${edgeCount}]{source,target,relation,label}:`);
    for (const edge of g.edges!) {
      lines.push(`  ${edge.source},${edge.target},${edge.relation || ''},${escapeValue(edge.label || '')}`);
    }
  }

  return lines.join('\n');
}
