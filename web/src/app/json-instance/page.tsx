import UseCasePage from '@/components/UseCasePage';

export const metadata = {
  title: 'JSON Instance - Autoon',
  description: 'Model JSON data instances using Toon format',
};

export default function JsonInstancePage() {
  return (
    <UseCasePage
      category="instance"
      title="JSON Instance"
      description="Model JSON data instances with Toon. Represent structured data objects with their property values in a compact, tabular format ideal for LLM prompts."
      mediaType='application/autoon;profile="https://autoon.dev/profiles/json-instance"'
    />
  );
}
