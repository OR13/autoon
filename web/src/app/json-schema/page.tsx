import UseCaseDetailPage from '@/components/UseCaseDetailPage';

export const metadata = {
  title: 'JSON Schema - Autoon',
  description: 'Model JSON Schema definitions using Toon format',
};

const jsonExample = `{
  "$id": "https://example.com/person.schema.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Person",
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "description": "The person's first name."
    },
    "lastName": {
      "type": "string",
      "description": "The person's last name."
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "description": "Age in years."
    }
  },
  "required": ["firstName", "lastName"]
}`;

const toonExample = `$id:https://example.com/person.schema.json
$schema:https://json-schema.org/draft/2020-12/schema
title:Person
type:object
required[2]:firstName,lastName
properties{firstName,lastName,age}:
  {type,description}:
    string,The person's first name.
    string,The person's last name.
  {type,minimum,description}:
    integer,0,Age in years.`;

export default function JsonSchemaPage() {
  return (
    <UseCaseDetailPage
      title="JSON Schema"
      subtitle="Define data structures with validation rules in a compact, human-readable format"
      formatName="JSON Schema"
      formatDescription="JSON Schema is a vocabulary that allows you to annotate and validate JSON documents. It describes the structure of JSON data, including property types, required fields, value constraints, and documentation. JSON Schema enables automatic validation, documentation generation, and code generation from a single source of truth."
      creator="JSON Schema Organization"
      standardsBody="IETF Internet-Draft"
      standardsUrl="https://json-schema.org/specification"
      praise={[
        'Self-documenting - schemas serve as both validation and documentation',
        'Wide ecosystem support with validators in every major language',
        'Enables automatic form generation and API documentation',
        'Composable with $ref for reusable definitions',
      ]}
      complaints={[
        'Verbose syntax requires significant boilerplate',
        'Deep nesting makes complex schemas hard to read',
        'Large schemas consume many tokens in LLM prompts',
        'Difficult to diff and review in version control',
      ]}
      mediaType='application/autoon; profile="https://autoon.dev/json-schema"'
      llmGuidance={{
        summary: "When using TOON for JSON Schema definitions in LLM applications, the compact format significantly reduces token consumption while preserving all validation semantics. This is particularly valuable when including schemas in system prompts, function definitions, or structured output specifications.",
        tips: [
          "Include the TOON schema in your system prompt to define expected output structure with fewer tokens than JSON Schema",
          "Use TOON schemas in tool/function definitions to specify parameter types and constraints compactly",
          "When asking LLMs to generate schemas, request TOON format output to reduce response tokens",
          "Convert existing JSON Schemas to TOON before embedding in prompts to maximize context window utilization",
          "Pair the schema with a brief example instance to help the LLM understand the expected data shape",
        ],
        promptExample: `You are a data validation assistant. Use this schema to validate user input:

Content-Type: application/autoon; profile="https://autoon.dev/json-schema"

$schema:https://json-schema.org/draft/2020-12/schema
title:UserInput
type:object
required[2]:name,email
properties{name,email,age}:
  {type,description}:
    string,User's full name
    string,Valid email address
  {type,minimum}:
    integer,0

Validate the following input and return any errors in TOON format.`,
      }}
      jsonExample={jsonExample}
      toonExample={toonExample}
    />
  );
}
