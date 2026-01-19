/**
 * Autoon Validator using AJV
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { AutoonDocument, ValidationResult } from './types.js';
import autoonSchema from '../schemas/autoon.schema.json';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(autoonSchema);

export function validateAutoon(doc: unknown): ValidationResult {
  const valid = validate(doc);
  
  if (valid) {
    return { valid: true };
  }
  
  return {
    valid: false,
    errors: validate.errors?.map(err => ({
      path: err.instancePath || '/',
      message: err.message || 'Unknown error',
      keyword: err.keyword
    }))
  };
}

export function validateAutoonDocument(doc: AutoonDocument): ValidationResult {
  return validateAutoon(doc);
}

// Quick validation for specific graph types
export function validateClass(doc: AutoonDocument): ValidationResult {
  const result = validateAutoon(doc);
  if (!result.valid) return result;
  
  const graph = doc.graph || doc.graphs?.[0];
  if (graph?.type !== 'class') {
    return {
      valid: false,
      errors: [{ path: '/graph/type', message: 'Expected graph type "class"' }]
    };
  }
  return result;
}

export function validateInstance(doc: AutoonDocument): ValidationResult {
  const result = validateAutoon(doc);
  if (!result.valid) return result;
  
  const graph = doc.graph || doc.graphs?.[0];
  if (graph?.type !== 'instance') {
    return {
      valid: false,
      errors: [{ path: '/graph/type', message: 'Expected graph type "instance"' }]
    };
  }
  return result;
}

export function validateProcess(doc: AutoonDocument): ValidationResult {
  const result = validateAutoon(doc);
  if (!result.valid) return result;
  
  const graph = doc.graph || doc.graphs?.[0];
  if (graph?.type !== 'process') {
    return {
      valid: false,
      errors: [{ path: '/graph/type', message: 'Expected graph type "process"' }]
    };
  }
  return result;
}

export function validateWorkflow(doc: AutoonDocument): ValidationResult {
  const result = validateAutoon(doc);
  if (!result.valid) return result;
  
  const graph = doc.graph || doc.graphs?.[0];
  if (graph?.type !== 'workflow') {
    return {
      valid: false,
      errors: [{ path: '/graph/type', message: 'Expected graph type "workflow"' }]
    };
  }
  return result;
}
