import UseCasePage from '@/components/UseCasePage';

export const metadata = {
  title: 'LiteGraph - Autoon',
  description: 'Model ComfyUI and LiteGraph workflows using Toon format',
};

export default function LiteGraphPage() {
  return (
    <UseCasePage
      category="litegraph"
      title="LiteGraph / ComfyUI"
      description="Model node-based workflows with Toon for ComfyUI and LiteGraph. Define nodes, connections, and widget values for image generation pipelines and other visual programming workflows."
      mediaType='application/autoon;profile="https://autoon.dev/profiles/litegraph"'
    />
  );
}
