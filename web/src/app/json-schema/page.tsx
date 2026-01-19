import UseCasePage from '@/components/UseCasePage';

export const metadata = {
  title: 'JSON Schema - Autoon',
  description: 'Model JSON Schema definitions using Toon format',
};

export default function JsonSchemaPage() {
  return (
    <UseCasePage
      category="schema"
      title="JSON Schema"
      description="Model JSON Schema definitions with Toon. Define object structures, property types, constraints, and validation rules in a compact, human-readable format."
      mediaType='application/autoon;profile="https://autoon.dev/profiles/json-schema"'
    />
  );
}
