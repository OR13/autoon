import UseCasePage from '@/components/UseCasePage';

export const metadata = {
  title: 'Generative UI - Autoon',
  description: 'Model UI components for AI-generated interfaces using Toon format',
};

export default function GenerativeUIPage() {
  return (
    <UseCasePage
      category="generative-ui"
      title="Generative UI"
      description="Model UI components with Toon for AI-generated interfaces. Define Cards, Metrics, Forms, Charts, and other UI elements that can be safely rendered from AI-produced JSON."
      mediaType='application/autoon;profile="https://autoon.dev/profiles/generative-ui"'
    />
  );
}
