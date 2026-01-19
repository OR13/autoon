'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AutoonDocument, NodeType } from '@/types/autoon';

// Node colors by type
const NODE_COLORS: Record<string, string> = {
  class: '#3b82f6',
  attribute: '#f59e0b',
  method: '#a78bfa',
  instance: '#10b981',
  state: '#f472b6',
  action: '#22d3ee',
  decision: '#fbbf24',
  start: '#34d399',
  end: '#f87171',
  fork: '#6b7280',
  join: '#6b7280',
};

const NODE_BG_COLORS: Record<string, string> = {
  class: '#1e3a5f',
  attribute: '#4a3520',
  method: '#3d2d5a',
  instance: '#1a3d30',
  state: '#4a2040',
  action: '#1a3d40',
  decision: '#4a3d10',
  start: '#1a3d25',
  end: '#4a2020',
  fork: '#2a2a2a',
  join: '#2a2a2a',
};

interface GraphEditorProps {
  document: AutoonDocument | null;
  onSync?: (doc: AutoonDocument) => void;
  className?: string;
}

export default function GraphEditor({ document, onSync, className }: GraphEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<InstanceType<typeof import('litegraph.js').LGraph> | null>(null);
  const graphCanvasRef = useRef<InstanceType<typeof import('litegraph.js').LGraphCanvas> | null>(null);
  const nodeIdMapRef = useRef<Record<string, number>>({});
  const isUpdatingRef = useRef(false);
  const LiteGraphRef = useRef<typeof import('litegraph.js') | null>(null);

  const registerNodeTypes = useCallback(() => {
    const LiteGraph = LiteGraphRef.current;
    if (!LiteGraph) return;

    const nodeTypes: NodeType[] = [
      'class', 'attribute', 'method', 'instance', 'state',
      'action', 'decision', 'start', 'end', 'fork', 'join',
    ];

    nodeTypes.forEach((type) => {
      // Check if already registered
      if (LiteGraph.LiteGraph.registered_node_types[`autoon/${type}`]) return;

      class AutoonNode extends LiteGraph.LGraphNode {
        static title = type.charAt(0).toUpperCase() + type.slice(1);
        static desc = `${type} node`;

        constructor() {
          super();
          this.title = type.charAt(0).toUpperCase() + type.slice(1);
          this.addOutput('out', 'flow');
          this.addInput('in', 'flow');
          this.properties = {
            nodeId: '',
            nodeType: type,
            label: 'Node',
          };
          this.size = [180, 60];
          this.color = NODE_COLORS[type];
          this.bgcolor = NODE_BG_COLORS[type];

          if (type === 'decision') {
            this.addOutput('yes', 'flow');
            this.addOutput('no', 'flow');
            this.size = [140, 80];
          } else if (type === 'start') {
            this.inputs = [];
            this.size = [120, 50];
          } else if (type === 'end') {
            this.outputs = [];
            this.size = [120, 50];
          } else if (type === 'fork') {
            this.addOutput('out2', 'flow');
            this.size = [100, 60];
          } else if (type === 'join') {
            this.addInput('in2', 'flow');
            this.size = [100, 60];
          } else if (type === 'attribute' || type === 'method') {
            this.size = [160, 50];
          }
        }

        onDrawForeground(ctx: CanvasRenderingContext2D) {
          ctx.font = '12px Outfit, sans-serif';
          ctx.fillStyle = '#e8ecf4';
          ctx.textAlign = 'center';
          ctx.fillText(
            (this.properties as { label: string }).label || this.title,
            this.size[0] / 2,
            this.size[1] / 2 + 4
          );
        }

        getTitle() {
          return (this.properties as { label: string }).label || 'Node';
        }
      }

      LiteGraph.LiteGraph.registerNodeType(`autoon/${type}`, AutoonNode);
    });
  }, []);

  const loadDocToGraph = useCallback((doc: AutoonDocument) => {
    const LiteGraph = LiteGraphRef.current;
    const graph = graphRef.current;
    const graphCanvas = graphCanvasRef.current;

    if (!LiteGraph || !graph || !graphCanvas || !doc) return;

    isUpdatingRef.current = true;
    graph.clear();
    nodeIdMapRef.current = {};

    const g = doc.graph || (doc.graphs && doc.graphs[0]);
    if (!g || !g.nodes) {
      isUpdatingRef.current = false;
      return;
    }

    const nodes = Object.entries(g.nodes);
    const edges = g.edges || [];
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacingX = 220;
    const spacingY = 120;
    const offsetX = 100;
    const offsetY = 80;

    nodes.forEach(([id, nodeData], i) => {
      const nodeType = nodeData.type || 'class';
      const col = i % cols;
      const row = Math.floor(i / cols);

      let lgNode;
      try {
        lgNode = LiteGraph.LiteGraph.createNode(`autoon/${nodeType}`);
      } catch {
        lgNode = LiteGraph.LiteGraph.createNode('autoon/class');
      }

      if (lgNode) {
        lgNode.pos = [offsetX + col * spacingX, offsetY + row * spacingY];
        lgNode.properties = {
          nodeId: id,
          label: nodeData.label || id,
          nodeType: nodeType,
        };
        lgNode.title = nodeData.label || id;
        graph.add(lgNode);
        nodeIdMapRef.current[id] = lgNode.id;
      }
    });

    edges.forEach((edge) => {
      const sourceId = nodeIdMapRef.current[edge.source];
      const targetId = nodeIdMapRef.current[edge.target];

      if (sourceId !== undefined && targetId !== undefined) {
        const sourceNode = graph.getNodeById(sourceId);
        const targetNode = graph.getNodeById(targetId);

        if (sourceNode && targetNode) {
          let outputSlot = 0;
          let inputSlot = 0;

          if (sourceNode.outputs) {
            for (let i = 0; i < sourceNode.outputs.length; i++) {
              if (sourceNode.outputs[i].name === 'out') {
                outputSlot = i;
                break;
              }
            }
          }

          if (targetNode.inputs) {
            for (let i = 0; i < targetNode.inputs.length; i++) {
              if (targetNode.inputs[i].name === 'in') {
                inputSlot = i;
                break;
              }
            }
          }

          sourceNode.connect(outputSlot, targetNode, inputSlot);
        }
      }
    });

    isUpdatingRef.current = false;
    graphCanvas.setDirty(true, true);
  }, []);

  const syncToText = useCallback(() => {
    const graph = graphRef.current;
    if (!graph || !onSync) return;

    // Use type assertion to access internal properties
    type GraphNode = {
      id: number;
      title: string;
      properties: Record<string, unknown>;
    };
    const nodes = (graph as unknown as { _nodes: GraphNode[] })._nodes || [];
    const links = graph.links || {};

    const doc: AutoonDocument = {
      graph: {
        id: 'untitled',
        type: 'class',
        label: '',
        directed: true,
        nodes: {},
        edges: [],
      },
    };

    const lgNodeIdToAutoonId: Record<number, string> = {};
    nodes.forEach((node) => {
      const autoonId = (node.properties as { nodeId?: string }).nodeId || `node_${node.id}`;
      lgNodeIdToAutoonId[node.id] = autoonId;
      doc.graph!.nodes[autoonId] = {
        label: (node.properties as { label?: string }).label || node.title,
        type: (node.properties as { nodeType?: NodeType }).nodeType || 'class',
      };
    });

    Object.values(links).forEach((link) => {
      if (!link) return;
      const sourceId = lgNodeIdToAutoonId[link.origin_id];
      const targetId = lgNodeIdToAutoonId[link.target_id];
      if (sourceId && targetId) {
        doc.graph!.edges!.push({
          source: sourceId,
          target: targetId,
          relation: 'flows',
        });
      }
    });

    onSync(doc);
  }, [onSync]);

  // Initialize LiteGraph
  useEffect(() => {
    const initLiteGraph = async () => {
      // Dynamic import for client-side only
      const LiteGraph = await import('litegraph.js');
      LiteGraphRef.current = LiteGraph;

      if (!canvasRef.current || !containerRef.current) return;

      registerNodeTypes();

      const graph = new LiteGraph.LGraph();
      graphRef.current = graph;

      const graphCanvas = new LiteGraph.LGraphCanvas(canvasRef.current, graph);
      graphCanvasRef.current = graphCanvas;

      // LiteGraph types are incomplete, use any for customization
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gc = graphCanvas as any;
      gc.background_image = null;
      gc.clear_background_color = '#0a0c10';
      gc.render_shadows = false;
      gc.render_curved_connections = true;
      gc.connections_width = 2;
      gc.default_link_color = '#5a6a84';

      const resizeCanvas = () => {
        if (canvasRef.current && containerRef.current) {
          canvasRef.current.width = containerRef.current.clientWidth;
          canvasRef.current.height = containerRef.current.clientHeight;
          graphCanvas.resize();
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      graph.start();

      // Load initial document if available
      if (document) {
        loadDocToGraph(document);
      }

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        graph.stop();
      };
    };

    initLiteGraph();
  }, [registerNodeTypes, loadDocToGraph, document]);

  // Update graph when document changes
  useEffect(() => {
    if (document && graphRef.current && !isUpdatingRef.current) {
      loadDocToGraph(document);
    }
  }, [document, loadDocToGraph]);

  const handleFitView = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.ds.reset();
      graphCanvasRef.current.setDirty(true, true);
    }
  };

  const handleArrange = () => {
    const graph = graphRef.current;
    if (!graph) return;

    const nodes = (graph as unknown as { _nodes: { pos: number[] }[] })._nodes || [];
    const cols = Math.ceil(Math.sqrt(nodes.length));

    nodes.forEach((node, i) => {
      node.pos[0] = 100 + (i % cols) * 220;
      node.pos[1] = 80 + Math.floor(i / cols) * 120;
    });

    graphCanvasRef.current?.setDirty(true, true);
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="flex gap-1 p-2 bg-[#0a0c10] border-b border-[#2a3342]">
        <button
          onClick={handleFitView}
          className="px-3 py-1.5 text-xs bg-[#1a1f2a] hover:bg-[#242b3a] border border-[#2a3342] rounded text-[#e8ecf4]"
        >
          Fit View
        </button>
        <button
          onClick={handleArrange}
          className="px-3 py-1.5 text-xs bg-[#1a1f2a] hover:bg-[#242b3a] border border-[#2a3342] rounded text-[#e8ecf4]"
        >
          Auto Arrange
        </button>
        <button
          onClick={syncToText}
          className="px-3 py-1.5 text-xs bg-[#1a1f2a] hover:bg-[#242b3a] border border-[#2a3342] rounded text-[#e8ecf4]"
        >
          Sync to Text
        </button>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
