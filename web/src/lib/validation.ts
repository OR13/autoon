import { AutoonDocument, ValidationResult, GraphType } from '@/types/autoon';

const VALID_TYPES: GraphType[] = ['class', 'instance', 'process', 'workflow'];

export function validateAutoon(doc: AutoonDocument): ValidationResult {
  const errors: { path: string; message: string }[] = [];

  if (!doc || typeof doc !== 'object') {
    errors.push({ path: '/', message: 'Document must be an object' });
    return { valid: false, errors };
  }

  const g = doc.graph || (doc.graphs && doc.graphs[0]);
  if (!g) {
    errors.push({ path: '/', message: 'Must have "graph" property' });
    return { valid: false, errors };
  }

  if (!g.type || !VALID_TYPES.includes(g.type)) {
    errors.push({ path: '/graph/type', message: `Type must be one of: ${VALID_TYPES.join(', ')}` });
  }

  if (!g.nodes || typeof g.nodes !== 'object') {
    errors.push({ path: '/graph/nodes', message: 'Nodes must be an object' });
  }

  return { valid: errors.length === 0, errors };
}
