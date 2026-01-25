'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HiArrowsExpand } from 'react-icons/hi';

interface LiteGraphNode {
  id: number | string;
  type: string;
  pos: [number, number];
  size?: [number, number];
  widgets_values?: unknown[];
  inputs?: Array<{ name: string; type: string; link?: number | null }>;
  outputs?: Array<{ name: string; type: string; links?: number[] | null }>;
  properties?: Record<string, unknown>;
  title?: string;
}

interface LiteGraphLink {
  id: number;
  origin_id: number | string;
  origin_slot: number | string;
  target_id: number | string;
  target_slot: number | string;
  type?: string;
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

  const loadLiteGraphData = useCallback((data: LiteGraphJson) => {
    const LiteGraph = LiteGraphRef.current;
    const lgGraph = graphRef.current;
    const graphCanvas = graphCanvasRef.current;

    if (!LiteGraph || !lgGraph || !graphCanvas || !data) return;

    lgGraph.clear();
    const nodeIdMap: Record<string | number, number> = {};

    // Add nodes
    data.nodes.forEach((node) => {
      const lgNode = new LiteGraph.LGraphNode();
      // Add space prefix for visual padding since LiteGraph doesn't support title padding
      lgNode.title = '  ' + (node.title || node.type);
      lgNode.pos = [...node.pos] as [number, number];
      lgNode.size = node.size ? [...node.size] as [number, number] : [220, 80];

      if (node.inputs) {
        node.inputs.forEach((input) => {
          lgNode.addInput(input.name, input.type);
        });
      }

      if (node.outputs) {
        node.outputs.forEach((output) => {
          lgNode.addOutput(output.name, output.type);
        });
      }

      lgGraph.add(lgNode);
      nodeIdMap[node.id] = lgNode.id;
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

      const lgGraph = new LiteGraph.LGraph();
      graphRef.current = lgGraph;

      const graphCanvas = new LiteGraph.LGraphCanvas(canvasRef.current, lgGraph);
      graphCanvasRef.current = graphCanvas;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gc = graphCanvas as any;

      // Dark theme with good contrast
      gc.background_image = null;
      gc.clear_background_color = '#0A0A0A';
      gc.render_shadows = false;
      gc.render_curved_connections = true;
      gc.connections_width = 3;
      gc.highquality_render = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lgConfig = LiteGraph.LiteGraph as any;

      // Node colors - dark theme with gold accents
      lgConfig.NODE_DEFAULT_COLOR = '#2A2418';
      lgConfig.NODE_DEFAULT_BGCOLOR = '#1A1A1A';
      lgConfig.NODE_DEFAULT_BOXCOLOR = '#3D3528';
      lgConfig.NODE_TITLE_COLOR = '#F7C974';
      lgConfig.NODE_TEXT_COLOR = '#E0E0E0';
      lgConfig.NODE_SELECTED_TITLE_COLOR = '#FFD700';
      lgConfig.DEFAULT_SHADOW_COLOR = 'rgba(0,0,0,0.5)';

      // Title text padding from left edge
      gc.title_text_font = 'bold 13px Arial';
      gc.node_title_color = '#F7C974';


      // Link colors - visible gold
      lgConfig.LINK_COLOR = '#F7C974';
      lgConfig.EVENT_LINK_COLOR = '#FFD700';
      lgConfig.CONNECTING_LINK_COLOR = '#FFD700';

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
  }, [loadLiteGraphData, json]);

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
      <div
        className={`flex items-center justify-center h-full ${className || ''}`}
        style={{ color: 'var(--color-text-subtle)' }}
      >
        No workflow data to display
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full ${className || ''}`}
      style={{ backgroundColor: 'var(--color-bg-base)' }}
    >
      <div
        className="flex items-center gap-3 px-4"
        style={{
          height: 'var(--panel-header-height)',
          backgroundColor: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border-default)'
        }}
      >
        <button
          onClick={handleFitView}
          className="autoon-btn"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          <HiArrowsExpand className="w-3.5 h-3.5 mr-1.5" />
          Fit
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {json.nodes?.length || 0} nodes, {json.links?.length || 0} connections
        </span>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
