/**
 * Browser-compatible Autoon Converter
 */

export interface Metadata {
  [key: string]: unknown;
}

export interface Node {
  label?: string;
  type?: string;
  metadata?: Metadata;
}

export interface Edge {
  id?: string;
  source: string;
  target: string;
  relation?: string;
  label?: string;
  directed?: boolean;
  metadata?: Metadata;
}

export interface Graph {
  id?: string;
  type: 'class' | 'instance' | 'process' | 'workflow';
  label?: string;
  directed?: boolean;
  nodes: Record<string, Node>;
  edges?: Edge[];
  metadata?: Metadata;
}

export interface AutoonDocument {
  graph?: Graph;
  graphs?: Graph[];
}

/**
 * Convert Autoon JSON document to TOON format
 */
export function jsonToToon(doc: AutoonDocument): string {
  const lines: string[] = [];
  
  if (doc.graph) {
    lines.push(...graphToToon(doc.graph));
  }
  
  if (doc.graphs) {
    doc.graphs.forEach((graph, i) => {
      if (i > 0) lines.push('');
      lines.push(...graphToToon(graph));
    });
  }
  
  return lines.join('\n');
}

function graphToToon(graph: Graph): string[] {
  const lines: string[] = [];
  const nodeCount = Object.keys(graph.nodes).length;
  const edgeCount = graph.edges?.length || 0;
  
  // Graph header
  lines.push(`graph{id,type,label,directed}:`);
  lines.push(`  ${graph.id || ''},${graph.type},${escapeValue(graph.label || '')},${graph.directed !== false}`);
  lines.push('');
  
  // Nodes section
  if (nodeCount > 0) {
    lines.push(`nodes[${nodeCount}]{id,label,type}:`);
    for (const [id, node] of Object.entries(graph.nodes)) {
      lines.push(`  ${id},${escapeValue(node.label || '')},${node.type || ''}`);
    }
    lines.push('');
  }
  
  // Edges section
  if (edgeCount > 0) {
    lines.push(`edges[${edgeCount}]{source,target,relation,label}:`);
    for (const edge of graph.edges!) {
      lines.push(`  ${edge.source},${edge.target},${edge.relation || ''},${escapeValue(edge.label || '')}`);
    }
  }
  
  // Metadata section if present
  if (graph.metadata && Object.keys(graph.metadata).length > 0) {
    lines.push('');
    lines.push('metadata:');
    for (const [key, value] of Object.entries(graph.metadata)) {
      if (Array.isArray(value)) {
        lines.push(`  ${key}: [${value.map(v => escapeValue(String(v))).join(',')}]`);
      } else {
        lines.push(`  ${key}: ${escapeValue(String(value))}`);
      }
    }
  }
  
  return lines;
}

function escapeValue(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parse TOON format to Autoon JSON document
 */
export function toonToJson(toon: string): AutoonDocument {
  const lines = toon.split('\n').map(l => l.trimEnd());
  const doc: AutoonDocument = {};
  
  let currentSection: 'graph' | 'nodes' | 'edges' | 'metadata' | null = null;
  let graph: Graph = { type: 'class', nodes: {} };
  let fields: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim() === '') continue;
    
    const graphMatch = line.match(/^graph\{([^}]+)\}:$/);
    const nodesMatch = line.match(/^nodes\[(\d+)\]\{([^}]+)\}:$/);
    const edgesMatch = line.match(/^edges\[(\d+)\]\{([^}]+)\}:$/);
    const metadataMatch = line.match(/^metadata:$/);
    
    if (graphMatch) {
      currentSection = 'graph';
      fields = graphMatch[1].split(',').map(f => f.trim());
      continue;
    }
    
    if (nodesMatch) {
      currentSection = 'nodes';
      fields = nodesMatch[2].split(',').map(f => f.trim());
      continue;
    }
    
    if (edgesMatch) {
      currentSection = 'edges';
      fields = edgesMatch[2].split(',').map(f => f.trim());
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
      
      if (currentSection === 'graph') {
        const values = parseCSVLine(data);
        const obj: Record<string, unknown> = {};
        fields.forEach((field, idx) => {
          obj[field] = parseValue(values[idx] || '');
        });
        if (obj.id) graph.id = String(obj.id);
        if (obj.type) graph.type = obj.type as Graph['type'];
        if (obj.label) graph.label = String(obj.label);
        if (obj.directed !== undefined) graph.directed = obj.directed === true || obj.directed === 'true';
      }
      
      if (currentSection === 'nodes') {
        const values = parseCSVLine(data);
        const idIdx = fields.indexOf('id');
        const nodeId = values[idIdx] || `node_${Object.keys(graph.nodes).length}`;
        const node: Node = {};
        
        fields.forEach((field, idx) => {
          if (field === 'id') return;
          const val = values[idx];
          if (val) {
            if (field === 'label') node.label = val;
            if (field === 'type') node.type = val;
          }
        });
        
        graph.nodes[nodeId] = node;
      }
      
      if (currentSection === 'edges') {
        const values = parseCSVLine(data);
        const edge: Edge = { source: '', target: '' };
        
        fields.forEach((field, idx) => {
          const val = values[idx];
          if (val) {
            if (field === 'source') edge.source = val;
            if (field === 'target') edge.target = val;
            if (field === 'relation') edge.relation = val;
            if (field === 'label') edge.label = val;
          }
        });
        
        if (edge.source && edge.target) {
          graph.edges!.push(edge);
        }
      }
      
      if (currentSection === 'metadata') {
        const colonIdx = data.indexOf(':');
        if (colonIdx > 0) {
          const key = data.substring(0, colonIdx).trim();
          const value = data.substring(colonIdx + 1).trim();
          graph.metadata![key] = parseMetadataValue(value);
        }
      }
    }
  }
  
  doc.graph = graph;
  return doc;
}

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

function parseValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '') return undefined;
  const num = Number(value);
  if (!isNaN(num) && value !== '') return num;
  return value;
}

function parseMetadataValue(value: string): unknown {
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1);
    return inner.split(',').map(v => v.trim());
  }
  return parseValue(value);
}
