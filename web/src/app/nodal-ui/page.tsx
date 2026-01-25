import UseCaseDetailPage from '@/components/UseCaseDetailPage';

export const metadata = {
  title: 'Nodal UI - Autoon',
  description: 'Model node-based workflows using Toon format',
};

const jsonExample = `{
  "nodes": [
    {
      "id": 1,
      "type": "CheckpointLoaderSimple",
      "pos": [50, 200],
      "widgets_values": ["v1-5-pruned.safetensors"]
    },
    {
      "id": 2,
      "type": "CLIPTextEncode",
      "pos": [300, 100],
      "widgets_values": ["a beautiful sunset"]
    },
    {
      "id": 3,
      "type": "KSampler",
      "pos": [550, 200],
      "widgets_values": ["euler", 20, 8]
    }
  ],
  "links": [
    [1, 1, 0, 3, 0, "MODEL"],
    [2, 1, 1, 2, 0, "CLIP"],
    [3, 2, 0, 3, 1, "CONDITIONING"]
  ]
}`;

const toonExample = `nodes[3]{id,type,pos,widgets_values}:
  1,CheckpointLoaderSimple,[50\\,200],[v1-5-pruned.safetensors]
  2,CLIPTextEncode,[300\\,100],[a beautiful sunset]
  3,KSampler,[550\\,200],[euler\\,20\\,8]
links[3]:
  [1,1,0,3,0,MODEL]
  [2,1,1,2,0,CLIP]
  [3,2,0,3,1,CONDITIONING]`;

export default function NodalUIPage() {
  return (
    <UseCaseDetailPage
      title="Nodal UI"
      subtitle="Define node-based workflows for visual programming interfaces"
      formatName="Nodal UI JSON"
      formatDescription="Nodal UI encompasses node-based visual programming formats like LiteGraph and ComfyUI. These systems represent workflows as graphs with nodes (operations) connected by links (data flow). Popular in AI image generation (ComfyUI, Stable Diffusion), audio processing, and creative tools, nodal interfaces make complex pipelines accessible through visual programming."
      creator="Various (LiteGraph, ComfyUI, etc.)"
      standardsBody="Community Standards"
      standardsUrl="https://github.com/comfyanonymous/ComfyUI"
      praise={[
        'Visual programming makes complex pipelines accessible',
        'Workflows are portable and shareable as JSON files',
        'Extensible node system supports custom operations',
        'Active community with thousands of custom nodes',
      ]}
      complaints={[
        'Workflow JSON files are very large and verbose',
        'Position data and metadata inflate file sizes',
        'Difficult to diff workflows in version control',
        'Manual JSON editing is error-prone',
      ]}
      mediaType='application/autoon; profile="https://autoon.dev/nodal-ui"'
      llmGuidance={{
        summary: "Node-based workflows are an ideal use case for TOON because they contain highly repetitive structures: arrays of nodes with similar properties, and arrays of links with identical schemas. TOON can reduce workflow file sizes by 60-80%, making it practical to include entire workflows in LLM prompts for analysis, modification, or generation.",
        tips: [
          "Convert ComfyUI/LiteGraph workflows to TOON before asking LLMs to analyze or modify them",
          "Request workflow modifications in TOON format—the LLM needs to output fewer tokens",
          "Use TOON when generating workflows from natural language descriptions",
          "Store workflow templates in TOON for efficient retrieval in workflow-generation systems",
          "When comparing workflows, TOON's line-based format makes diffs readable and meaningful",
        ],
        promptExample: `Modify this image generation workflow to add a negative prompt encoder.

Content-Type: application/autoon; profile="https://autoon.dev/nodal-ui"

nodes[3]{id,type,pos,widgets_values}:
  1,CheckpointLoaderSimple,[50\\,200],[v1-5-pruned.safetensors]
  2,CLIPTextEncode,[300\\,100],[a sunset over mountains]
  3,KSampler,[550\\,200],[euler\\,20\\,8]
links[2]{id,origin_id,origin_slot,target_id,target_slot,type}:
  1,1,0,3,0,MODEL
  2,2,0,3,1,CONDITIONING

Add a new CLIPTextEncode node for the negative prompt "blurry, bad quality"
and connect it to KSampler's negative input (slot 2).
Output the modified workflow in the same TOON format.`,
      }}
      jsonExample={jsonExample}
      toonExample={toonExample}
    />
  );
}
