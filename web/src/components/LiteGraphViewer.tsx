'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from 'flowbite-react';
import { HiArrowsExpand } from 'react-icons/hi';

// Node type colors for ComfyUI workflow
const NODE_TYPE_COLORS: Record<string, { color: string; bgcolor: string }> = {
  CheckpointLoaderSimple: { color: '#8B5CF6', bgcolor: '#2D1B69' },
  CLIPTextEncode: { color: '#22C55E', bgcolor: '#052E16' },
  KSampler: { color: '#EAB308', bgcolor: '#422006' },
  VAEDecode: { color: '#3B82F6', bgcolor: '#172554' },
  VAEEncode: { color: '#3B82F6', bgcolor: '#172554' },
  LoadImage: { color: '#F97316', bgcolor: '#431407' },
  SaveImage: { color: '#F97316', bgcolor: '#431407' },
  default: { color: '#6B7280', bgcolor: '#1F2937' },
};

interface LiteGraphNode {
  id: number | string;
  type: string;
  pos: [number, number];
  size?: [number, number];
  widgets_values?: unknown[];
  inputs?: Array<{ name: string; type: string; link?: number | null }>;
  outputs?: Array<{ name: string; type: string; links?: number[] | null }>;
  properties?: Record<string, unknown>;
}

interface LiteGraphLink {
  id: number;
  origin_id: number | string;
  origin_slot: number | string;
  target_id: number | string;
  target_slot: number | string;
  type: string;
}

interface LiteGraphJson {
  version?: number;
  nodes: LiteGraphNode[];
  links: LiteGraphLink[];
  config?: Record<string, unknown>;
  state?: Record<string, unknown>;
}

interface LiteGraphViewerProps {
  json: LiteGraphJson | null;
  className?: string;
}

export default function LiteGraphViewer({ json, className }: LiteGraphViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<InstanceType<typeof import('litegraph.js').LGraph> | null>(null);
  const graphCanvasRef = useRef<InstanceType<typeof import('litegraph.js').LGraphCanvas> | null>(null);
  const LiteGraphRef = useRef<typeof import('litegraph.js') | null>(null);

  const registerNodeTypes = useCallback(() => {
    const LiteGraph = LiteGraphRef.current;
    if (!LiteGraph) return;

    // Register common ComfyUI node types
    const nodeTypes = [
      'CheckpointLoaderSimple',
      'CLIPTextEncode',
      'KSampler',
      'VAEDecode',
      'VAEEncode',
      'LoadImage',
      'SaveImage',
      'EmptyLatentImage',
      'LatentUpscale',
      'ControlNetLoader',
      'ControlNetApply',
    ];

    nodeTypes.forEach((type) => {
      const fullType = `comfy/${type}`;
      if (LiteGraph.LiteGraph.registered_node_types[fullType]) return;

      const colors = NODE_TYPE_COLORS[type] || NODE_TYPE_COLORS.default;

      class ComfyNode extends LiteGraph.LGraphNode {
        static title = type;
        static desc = `ComfyUI ${type} node`;

        constructor() {
          super();
          this.title = type;
          this.properties = { nodeType: type };
          this.size = [200, 80];
          this.color = colors.color;
          this.bgcolor = colors.bgcolor;
        }

        onDrawForeground(ctx: CanvasRenderingContext2D) {
          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.fillText(this.title, this.size[0] / 2, this.size[1] / 2 + 4);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      }

      LiteGraph.LiteGraph.registerNodeType(fullType, ComfyNode);
    });
  }, []);

  const loadLiteGraphData = useCallback((data: LiteGraphJson) => {
    const LiteGraph = LiteGraphRef.current;
    const lgGraph = graphRef.current;
    const graphCanvas = graphCanvasRef.current;

    if (!LiteGraph || !lgGraph || !graphCanvas || !data) return;

    lgGraph.clear();
    const nodeIdMap: Record<string | number, number> = {};

    // Add nodes
    data.nodes.forEach((node) => {
      const nodeType = `comfy/${node.type}`;
      let lgNode;

      try {
        lgNode = LiteGraph.LiteGraph.createNode(nodeType);
      } catch {
        // Fall back to creating a generic node
        lgNode = new LiteGraph.LGraphNode();
        lgNode.title = node.type;
        const colors = NODE_TYPE_COLORS[node.type] || NODE_TYPE_COLORS.default;
        lgNode.color = colors.color;
        lgNode.bgcolor = colors.bgcolor;
      }

      if (lgNode) {
        lgNode.pos = node.pos;
        lgNode.size = node.size || [200, 80];
        lgNode.title = node.type;

        // Add inputs
        if (node.inputs) {
          node.inputs.forEach((input) => {
            lgNode.addInput(input.name, input.type);
          });
        }

        // Add outputs
        if (node.outputs) {
          node.outputs.forEach((output) => {
            lgNode.addOutput(output.name, output.type);
          });
        }

        lgGraph.add(lgNode);
        nodeIdMap[node.id] = lgNode.id;
      }
    });

    // Add links
    data.links.forEach((link) => {
      const sourceId = nodeIdMap[link.origin_id];
      const targetId = nodeIdMap[link.target_id];

      if (sourceId !== undefined && targetId !== undefined) {
        const sourceNode = lgGraph.getNodeById(sourceId);
        const targetNode = lgGraph.getNodeById(targetId);

        if (sourceNode && targetNode) {
          const originSlot = typeof link.origin_slot === 'string' ? parseInt(link.origin_slot) : link.origin_slot;
          const targetSlot = typeof link.target_slot === 'string' ? parseInt(link.target_slot) : link.target_slot;
          sourceNode.connect(originSlot, targetNode, targetSlot);
        }
      }
    });

    graphCanvas.setDirty(true, true);
  }, []);

  useEffect(() => {
    const initLiteGraph = async () => {
      const LiteGraph = await import('litegraph.js');
      LiteGraphRef.current = LiteGraph;

      if (!canvasRef.current || !containerRef.current) return;

      registerNodeTypes();

      const lgGraph = new LiteGraph.LGraph();
      graphRef.current = lgGraph;

      const graphCanvas = new LiteGraph.LGraphCanvas(canvasRef.current, lgGraph);
      graphCanvasRef.current = graphCanvas;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gc = graphCanvas as any;
      gc.background_image = null;
      gc.clear_background_color = '#030712';
      gc.render_shadows = false;
      gc.render_curved_connections = true;
      gc.connections_width = 2;
      gc.default_link_color = '#6b7280';

      const resizeCanvas = () => {
        if (canvasRef.current && containerRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = containerRef.current.clientHeight;
          graphCanvas.resize();
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      lgGraph.start();

      if (json) {
        loadLiteGraphData(json);
      }

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        lgGraph.stop();
      };
    };

    initLiteGraph();
  }, [registerNodeTypes, loadLiteGraphData, json]);

  useEffect(() => {
    if (json && graphRef.current) {
      loadLiteGraphData(json);
    }
  }, [json, loadLiteGraphData]);

  const handleFitView = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.ds.reset();
      graphCanvasRef.current.setDirty(true, true);
    }
  };

  if (!json) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className || ''}`}>
        No LiteGraph data to display
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="flex items-center gap-2 h-10 px-4 bg-gray-900 border-b border-gray-800">
        <Button size="xs" color="gray" onClick={handleFitView}>
          <HiArrowsExpand className="w-3.5 h-3.5 mr-1.5" />
          Fit
        </Button>
        <span className="text-xs text-gray-500">
          {json.nodes?.length || 0} nodes, {json.links?.length || 0} connections
        </span>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
