import UseCasePage from '@/components/UseCasePage';

export const metadata = {
  title: 'JSON Render - Autoon',
  description: 'Model UI components for AI-generated interfaces using Toon format',
};

export default function JsonRenderPage() {
  return (
    <UseCasePage
      category="jsonrender"
      title="JSON Render"
      description="Model UI components with Toon for AI-generated interfaces. Define Cards, Metrics, Forms, Charts, and other UI elements that can be safely rendered from AI-produced JSON."
      mediaType='application/autoon;profile="https://autoon.dev/profiles/json-render"'
    />
  );
}
