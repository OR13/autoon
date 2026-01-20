'use client';

import { useEffect, useRef, useCallback } from 'react';
import { HiArrowsExpand } from 'react-icons/hi';

// Ayu Mirage Theme Colors
const THEME = {
  // Backgrounds
  bgBase: '#1F2430',
  bgSurface: '#232834',
  bgElevated: '#2D3441',
  bgMuted: '#3D4455',
  // Borders
  borderDefault: '#2D3441',
  borderMuted: '#3D4455',
  // Text
  textPrimary: '#CBCCC6',
  textSecondary: '#B8B4A8',
  textMuted: '#707A8C',
  textSubtle: '#5C6773',
  // Subtle accent palette for node borders (muted versions)
  accentsMuted: [
    '#8C7555', // muted orange
    '#8C8055', // muted yellow
    '#6B8C55', // muted green
    '#558C80', // muted cyan
    '#557C8C', // muted blue
    '#6B558C', // muted purple
    '#8C5560', // muted pink
  ],
};

// Canvas background color (matches CodeMirror background)
const CANVAS_BG = '#1f2430';

// Generate a consistent color index from a string (hash-based)
function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % THEME.accentsMuted.length;
}

// Get muted accent color for node borders
function getAccentColor(type: string): string {
  return THEME.accentsMuted[getColorIndex(type)];
}

// Generate dark background color for nodes
function getNodeBgColor(type: string): string {
  const colorIndex = getColorIndex(type);
  // Very dark backgrounds for good text contrast
  const bgColors = [
    '#1E1A16', // dark orange bg
    '#1E1C16', // dark yellow bg
    '#181E16', // dark green bg
    '#161E1C', // dark cyan bg
    '#161A1E', // dark blue bg
    '#1A161E', // dark purple bg
    '#1E161A', // dark pink bg
  ];
  return bgColors[colorIndex];
}

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
  const linkTypesRef = useRef<Set<string>>(new Set());

  const loadLiteGraphData = useCallback((data: LiteGraphJson) => {
    const LiteGraph = LiteGraphRef.current;
    const lgGraph = graphRef.current;
    const graphCanvas = graphCanvasRef.current;

    if (!LiteGraph || !lgGraph || !graphCanvas || !data) return;

    lgGraph.clear();
    linkTypesRef.current.clear();
    const nodeIdMap: Record<string | number, number> = {};

    // Collect all unique link types for color assignment
    data.links.forEach((link) => {
      if (link.type) {
        linkTypesRef.current.add(link.type);
      }
    });

    // Register link type colors dynamically using theme accents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lg = LiteGraph.LiteGraph as any;
    linkTypesRef.current.forEach((type) => {
      lg.link_type_colors = lg.link_type_colors || {};
      lg.link_type_colors[type] = getAccentColor(type);
    });

    // Add nodes
    data.nodes.forEach((node) => {
      // Create a generic node
      const lgNode = new LiteGraph.LGraphNode();
      lgNode.title = node.title || node.type;
      lgNode.pos = [...node.pos] as [number, number];
      lgNode.size = node.size ? [...node.size] as [number, number] : [200, 80];
      
      // Assign colors based on node type
      lgNode.color = getAccentColor(node.type);
      lgNode.bgcolor = getNodeBgColor(node.type);

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
      
      // Canvas background
      gc.background_image = null;
      gc.clear_background_color = CANVAS_BG;
      
      // Connection styling - no borders or shadows
      gc.render_shadows = false;
      gc.render_curved_connections = true;
      gc.connections_width = 1.5;
      gc.default_link_color = THEME.textSubtle;
      gc.render_connections_border = false;
      gc.connections_shadow = false;
      gc.links_shadow_color = CANVAS_BG;
      gc.default_connection_color_byType = {};
      
      // Link colors
      LiteGraph.LiteGraph.CONNECTING_LINK_COLOR = THEME.textSubtle;
      LiteGraph.LiteGraph.LINK_COLOR = THEME.textSubtle;
      LiteGraph.LiteGraph.EVENT_LINK_COLOR = THEME.textSubtle;
      
      // Node styling
      gc.node_title_color = THEME.textPrimary;
      gc.default_connection_color = THEME.textMuted;
      
      // Rendering quality
      gc.highquality_render = true;
      gc.editor_alpha = 1;
      
      // Configure default node colors for good contrast
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lgConfig = LiteGraph.LiteGraph as any;
      lgConfig.NODE_DEFAULT_COLOR = THEME.textMuted;
      lgConfig.NODE_DEFAULT_BGCOLOR = '#1A1D24';
      lgConfig.NODE_DEFAULT_BOXCOLOR = THEME.borderDefault;
      lgConfig.NODE_TITLE_COLOR = THEME.textPrimary;
      lgConfig.NODE_TEXT_COLOR = THEME.textPrimary;
      lgConfig.NODE_SELECTED_TITLE_COLOR = THEME.textPrimary;
      lgConfig.DEFAULT_SHADOW_COLOR = 'rgba(0,0,0,0.5)';
      lgConfig.WIDGET_BGCOLOR = '#1A1D24';
      lgConfig.WIDGET_TEXT_COLOR = THEME.textPrimary;

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
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.25rem' }}
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
