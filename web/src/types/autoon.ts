// Autoon types based on JSON Graph Specification v2

export type GraphType = 'class' | 'instance' | 'process' | 'workflow';

export type NodeType = 
  | 'class' | 'attribute' | 'method'
  | 'instance'
  | 'state' | 'action' | 'decision'
  | 'start' | 'end'
  | 'fork' | 'join';

export interface AutoonNode {
  label?: string;
  type?: NodeType;
  metadata?: Record<string, unknown>;
}

export interface AutoonEdge {
  source: string;
  target: string;
  relation?: string;
  label?: string;
  directed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AutoonHyperedge {
  nodes: string[];
  relation?: string;
  source?: string[];
  target?: string[];
  metadata?: Record<string, unknown>;
}

export interface AutoonGraph {
  id?: string;
  type: GraphType;
  label?: string;
  directed?: boolean;
  nodes: Record<string, AutoonNode>;
  edges?: AutoonEdge[];
  hyperedges?: AutoonHyperedge[];
  metadata?: Record<string, unknown>;
}

export interface AutoonDocument {
  graph?: AutoonGraph;
  graphs?: AutoonGraph[];
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
