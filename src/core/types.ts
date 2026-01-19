/**
 * Autoon Core Types
 * Based on JSON Graph Specification with Autoon extensions
 */

export type GraphType = 'class' | 'instance' | 'process' | 'workflow';

export type NodeType = 
  | 'class' | 'attribute' | 'method'      // Class diagram
  | 'instance'                              // Instance diagram
  | 'state' | 'action' | 'decision'        // Process/State diagram
  | 'start' | 'end' | 'fork' | 'join';     // Workflow control nodes

export type EdgeRelation = 
  | 'inherits' | 'implements' | 'has' | 'uses' | 'creates'  // Class relations
  | 'transitions' | 'triggers'                                // Process relations
  | 'flows' | 'guards';                                       // Workflow relations

export interface Metadata {
  description?: string;
  version?: string;
  author?: string;
  created?: string;
  modified?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface Node {
  label?: string;
  type?: NodeType;
  metadata?: Metadata;
}

export interface Edge {
  id?: string;
  source: string;
  target: string;
  relation?: EdgeRelation;
  label?: string;
  directed?: boolean;
  metadata?: Metadata;
}

export interface Graph {
  id?: string;
  type: GraphType;
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

// TOON representation types
export interface ToonHeader {
  name: string;
  count?: number;
  fields?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    keyword?: string;
  }>;
}
