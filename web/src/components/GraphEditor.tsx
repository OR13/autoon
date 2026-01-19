'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Button } from 'flowbite-react';
import { HiViewGrid, HiArrowsExpand } from 'react-icons/hi';
import { SchemaGraph } from '@/lib/examples';

// Node colors by type
const NODE_COLORS: Record<string, string> = {
  object: '#eab308',      // yellow-500
  property: '#22c55e',    // green-500
  type: '#3b82f6',        // blue-500
  constraint: '#f97316',  // orange-500
};

const NODE_BG_COLORS: Record<string, string> = {
  object: '#422006',      // yellow-950
  property: '#052e16',    // green-950
  type: '#172554',        // blue-950
  constraint: '#431407',  // orange-950
};

interface GraphEditorProps {
  graph: SchemaGraph | null;
  className?: string;
}

export default function GraphEditor({ graph, className }: GraphEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<InstanceType<typeof import('litegraph.js').LGraph> | null>(null);
  const graphCanvasRef = useRef<InstanceType<typeof import('litegraph.js').LGraphCanvas> | null>(null);
  const LiteGraphRef = useRef<typeof import('litegraph.js') | null>(null);

  const registerNodeTypes = useCallback(() => {
    const LiteGraph = LiteGraphRef.current;
    if (!LiteGraph) return;

    const nodeTypes = ['object', 'property', 'type', 'constraint'];

    nodeTypes.forEach((type) => {
      if (LiteGraph.LiteGraph.registered_node_types[`schema/${type}`]) return;

      class SchemaNode extends LiteGraph.LGraphNode {
        static title = type.charAt(0).toUpperCase() + type.slice(1);
        static desc = `${type} node`;

        constructor() {
          super();
          this.title = type.charAt(0).toUpperCase() + type.slice(1);
          this.addOutput('out', 'flow');
          this.addInput('in', 'flow');
          this.properties = { nodeId: '', nodeType: type, label: 'Node' };
          this.size = [160, 50];
          this.color = NODE_COLORS[type];
          this.bgcolor = NODE_BG_COLORS[type];

          if (type === 'object') {
            this.size = [180, 60];
            this.inputs = [];
          } else if (type === 'constraint') {
            this.size = [200, 40];
            this.outputs = [];
          } else if (type === 'type') {
            this.size = [100, 40];
            this.outputs = [];
          }
        }

        onDrawForeground(ctx: CanvasRenderingContext2D) {
          ctx.font = 'bold 12px Outfit, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.fillText(
            (this.properties as { label: string }).label || this.title,
            this.size[0] / 2,
            this.size[1] / 2 + 4
          );
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        getTitle() {
          return (this.properties as { label: string }).label || 'Node';
        }
      }

      LiteGraph.LiteGraph.registerNodeType(`schema/${type}`, SchemaNode);
    });
  }, []);

  const loadGraphData = useCallback((schemaGraph: SchemaGraph) => {
    const LiteGraph = LiteGraphRef.current;
    const lgGraph = graphRef.current;
    const graphCanvas = graphCanvasRef.current;

    if (!LiteGraph || !lgGraph || !graphCanvas || !schemaGraph) return;

    lgGraph.clear();
    const nodeIdMap: Record<string, number> = {};

    // Layout: root at left, properties in column, types/constraints to right
    const nodes = Object.entries(schemaGraph.nodes);
    let propY = 80;
    
    nodes.forEach(([id, nodeData]) => {
      const nodeType = nodeData.type || 'property';
      
      let lgNode;
      try {
        lgNode = LiteGraph.LiteGraph.createNode(`schema/${nodeType}`);
      } catch {
        lgNode = LiteGraph.LiteGraph.createNode('schema/property');
      }

      if (lgNode) {
        // Position based on type
        if (nodeType === 'object') {
          lgNode.pos = [50, 200];
        } else if (nodeType === 'property') {
          lgNode.pos = [280, propY];
          propY += 80;
        } else if (nodeType === 'type') {
          // Find connected property to position relative to it
          const edge = schemaGraph.edges.find(e => e.target === id);
          if (edge && nodeIdMap[edge.source] !== undefined) {
            const sourceNode = lgGraph.getNodeById(nodeIdMap[edge.source]);
            if (sourceNode) {
              lgNode.pos = [sourceNode.pos[0] + 200, sourceNode.pos[1] - 20];
            } else {
              lgNode.pos = [500, propY - 60];
            }
          } else {
            lgNode.pos = [500, propY - 60];
          }
        } else if (nodeType === 'constraint') {
          const edge = schemaGraph.edges.find(e => e.target === id);
          if (edge && nodeIdMap[edge.source] !== undefined) {
            const sourceNode = lgGraph.getNodeById(nodeIdMap[edge.source]);
            if (sourceNode) {
              lgNode.pos = [sourceNode.pos[0] + 200, sourceNode.pos[1] + 20];
            } else {
              lgNode.pos = [500, propY - 40];
            }
          } else {
            lgNode.pos = [500, propY - 40];
          }
        }

        lgNode.properties = { nodeId: id, label: nodeData.label, nodeType };
        lgNode.title = nodeData.label;
        lgGraph.add(lgNode);
        nodeIdMap[id] = lgNode.id;
      }
    });

    // Add edges
    schemaGraph.edges.forEach((edge) => {
      const sourceId = nodeIdMap[edge.source];
      const targetId = nodeIdMap[edge.target];

      if (sourceId !== undefined && targetId !== undefined) {
        const sourceNode = lgGraph.getNodeById(sourceId);
        const targetNode = lgGraph.getNodeById(targetId);

        if (sourceNode && targetNode && sourceNode.outputs && targetNode.inputs) {
          sourceNode.connect(0, targetNode, 0);
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

      if (graph) {
        loadGraphData(graph);
      }

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        lgGraph.stop();
      };
    };

    initLiteGraph();
  }, [registerNodeTypes, loadGraphData, graph]);

  useEffect(() => {
    if (graph && graphRef.current) {
      loadGraphData(graph);
    }
  }, [graph, loadGraphData]);

  const handleFitView = () => {
    if (graphCanvasRef.current) {
      graphCanvasRef.current.ds.reset();
      graphCanvasRef.current.setDirty(true, true);
    }
  };

  const handleArrange = () => {
    const lgGraph = graphRef.current;
    if (!lgGraph || !graph) return;
    
    // Re-layout
    loadGraphData(graph);
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="flex items-center gap-2 h-10 px-4 bg-gray-900 border-b border-gray-800">
        <Button size="xs" color="gray" onClick={handleFitView}>
          <HiArrowsExpand className="w-3.5 h-3.5 mr-1.5" />
          Fit
        </Button>
        <Button size="xs" color="gray" onClick={handleArrange}>
          <HiViewGrid className="w-3.5 h-3.5 mr-1.5" />
          Arrange
        </Button>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}
