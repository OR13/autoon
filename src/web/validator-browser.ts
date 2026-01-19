/**
 * Browser-compatible Autoon Validator
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const autoonSchema = {
  "$id": "https://autoon.dev/schema/autoon.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Autoon Schema",
  "description": "Schema for Autoon model fragments: class, instance, process, workflow",
  "type": "object",
  "properties": {
    "graph": { "$ref": "#/$defs/graph" },
    "graphs": {
      "type": "array",
      "items": { "$ref": "#/$defs/graph" }
    }
  },
  "oneOf": [
    { "required": ["graph"] },
    { "required": ["graphs"] }
  ],
  "$defs": {
    "graph": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["class", "instance", "process", "workflow"],
          "description": "Autoon graph type"
        },
        "label": { "type": "string" },
        "directed": { "type": "boolean", "default": true },
        "nodes": {
          "type": "object",
          "additionalProperties": { "$ref": "#/$defs/node" }
        },
        "edges": {
          "type": "array",
          "items": { "$ref": "#/$defs/edge" }
        },
        "metadata": { "$ref": "#/$defs/metadata" }
      },
      "required": ["type", "nodes"]
    },
    "node": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "type": {
          "type": "string",
          "enum": ["class", "attribute", "method", "instance", "state", "action", "decision", "start", "end", "fork", "join"],
          "description": "Node type for visualization"
        },
        "metadata": { "type": "object" }
      }
    },
    "edge": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "source": { "type": "string" },
        "target": { "type": "string" },
        "relation": {
          "type": "string",
          "enum": ["inherits", "implements", "has", "uses", "creates", "transitions", "triggers", "flows", "guards"],
          "description": "Edge relation type"
        },
        "label": { "type": "string" },
        "directed": { "type": "boolean", "default": true },
        "metadata": { "type": "object" }
      },
      "required": ["source", "target"]
    },
    "metadata": {
      "type": "object",
      "properties": {
        "description": { "type": "string" },
        "version": { "type": "string" },
        "author": { "type": "string" },
        "created": { "type": "string", "format": "date-time" },
        "modified": { "type": "string", "format": "date-time" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": true
    }
  }
};

export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

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
