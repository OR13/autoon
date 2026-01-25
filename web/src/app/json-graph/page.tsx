import UseCaseDetailPage from '@/components/UseCaseDetailPage';

export const metadata = {
  title: 'JSON Graph - Autoon',
  description: 'Model graph structures using Toon format',
};

const jsonExample = `{
  "graph": {
    "id": "social-network",
    "type": "directed",
    "label": "Friend Connections",
    "nodes": {
      "alice": {
        "label": "Alice",
        "metadata": { "role": "admin", "joined": "2023-01" }
      },
      "bob": {
        "label": "Bob",
        "metadata": { "role": "user", "joined": "2023-03" }
      },
      "carol": {
        "label": "Carol",
        "metadata": { "role": "user", "joined": "2023-02" }
      }
    },
    "edges": [
      { "source": "alice", "target": "bob", "relation": "follows" },
      { "source": "bob", "target": "alice", "relation": "follows" },
      { "source": "alice", "target": "carol", "relation": "follows" },
      { "source": "carol", "target": "bob", "relation": "follows" }
    ]
  }
}`;

const toonExample = `graph{id,type,label}:social-network,directed,Friend Connections
nodes{alice,bob,carol}:
  {label,metadata}:
    Alice,{role,joined}:admin,2023-01
    Bob,{role,joined}:user,2023-03
    Carol,{role,joined}:user,2023-02
edges[4]{source,target,relation}:
  alice,bob,follows
  bob,alice,follows
  alice,carol,follows
  carol,bob,follows`;

export default function JsonGraphPage() {
  return (
    <UseCaseDetailPage
      title="JSON Graph"
      subtitle="Represent graph structures with nodes and edges in a standardized format"
      formatName="JSON Graph Format (JGF)"
      formatDescription="JSON Graph Format is a specification for representing graph structures in JSON. It provides a standardized way to serialize nodes, edges, and their metadata, enabling interoperability across graph databases, visualization tools, and analysis software. The format supports directed and undirected graphs, hyperedges, and custom metadata on any element."
      creator="jsongraph organization"
      standardsBody="JSON Graph Specification v2"
      standardsUrl="https://github.com/jsongraph/json-graph-specification"
      praise={[
        'Standardized format enables interoperability between graph tools',
        'Flexible metadata support for rich node and edge attributes',
        'Supports both simple graphs and complex hypergraphs',
        'Clear separation of structure (nodes/edges) from data (metadata)',
      ]}
      complaints={[
        'Verbose syntax for graphs with many edges',
        'Repeated property names inflate file sizes',
        'Node map keys duplicate label information',
        'Large graphs become unwieldy in JSON form',
      ]}
      mediaType='application/autoon; profile="https://autoon.dev/json-graph"'
      llmGuidance={{
        summary: "Graph data is an excellent use case for TOON because graphs contain highly repetitive structures: nodes with similar properties and edges with identical schemas. TOON can reduce graph serialization by 50-70%, making it practical to include graph context in LLM prompts for analysis, querying, or generation tasks.",
        tips: [
          "Convert knowledge graphs to TOON before asking LLMs to reason about relationships",
          "Use TOON format when generating graphs from natural language descriptions",
          "Include graph schemas in TOON to guide LLM output structure",
          "For graph RAG applications, store retrieved subgraphs in TOON to maximize context",
          "When asking LLMs to modify graphs, TOON's tabular edge format makes changes clear and auditable",
        ],
        promptExample: `Analyze this social network and identify the most influential user.

Content-Type: application/autoon; profile="https://autoon.dev/json-graph"

graph{id,type}:team-network,directed
nodes{alice,bob,carol,dan}:
  {label,metadata}:
    Alice,{role}:lead
    Bob,{role}:dev
    Carol,{role}:dev
    Dan,{role}:dev
edges[5]{source,target,relation}:
  alice,bob,mentors
  alice,carol,mentors
  bob,dan,collaborates
  carol,dan,collaborates
  dan,alice,reports-to

Based on the graph structure, who has the most connections?
Which relationships indicate leadership vs peer collaboration?`,
      }}
      jsonExample={jsonExample}
      toonExample={toonExample}
    />
  );
}
