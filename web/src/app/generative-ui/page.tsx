import UseCaseDetailPage from '@/components/UseCaseDetailPage';

export const metadata = {
  title: 'Generative UI - Autoon',
  description: 'Model UI components for AI-generated interfaces using Toon format',
};

const jsonExample = `{
  "type": "Card",
  "props": {
    "title": "Revenue Dashboard"
  },
  "children": [
    {
      "type": "Metric",
      "props": {
        "label": "Total Revenue",
        "value": "$125,430",
        "trend": "+12.5%"
      }
    },
    {
      "type": "Metric",
      "props": {
        "label": "Active Users",
        "value": "2,847",
        "trend": "+5.2%"
      }
    },
    {
      "type": "Button",
      "props": {
        "label": "View Details",
        "variant": "primary"
      }
    }
  ]
}`;

const toonExample = `type:Card
props{title}:Revenue Dashboard
children[3]{type,props}:
  Metric,{label,value,trend}:Total Revenue,$125\\,430,+12.5%
  Metric,{label,value,trend}:Active Users,2\\,847,+5.2%
  Button,{label,variant}:View Details,primary`;

export default function GenerativeUIPage() {
  return (
    <UseCaseDetailPage
      title="Generative UI"
      subtitle="Define UI components for AI-generated interfaces that can be safely rendered"
      formatName="JSON Render / Generative UI"
      formatDescription="Generative UI enables AI systems to produce structured UI component definitions that applications can safely render. Rather than generating raw HTML or code, AI outputs a declarative JSON structure describing components like Cards, Metrics, Forms, and Charts. This approach provides security (no arbitrary code execution), consistency (predictable component library), and flexibility (framework-agnostic definitions)."
      creator="Vercel"
      standardsBody="Vercel AI SDK"
      standardsUrl="https://sdk.vercel.ai/docs/ai-sdk-rsc/generative-ui"
      praise={[
        'Safe rendering - no arbitrary code execution from AI output',
        'Predictable components with consistent styling',
        'Framework-agnostic - works with React, Vue, or any renderer',
        'Enables rich, interactive AI responses beyond plain text',
      ]}
      complaints={[
        'Verbose nested structure for complex UIs',
        'Props objects repeat similar patterns',
        'Limited standardization - each implementation differs',
        'Large component trees consume many tokens',
      ]}
      mediaType='application/autoon; profile="https://autoon.dev/generative-ui"'
      llmGuidance={{
        summary: "For generative UI applications, TOON enables LLMs to produce rich component structures with significantly fewer output tokens. This reduces latency, cost, and streaming time while maintaining full expressiveness. The format naturally represents component hierarchies and repeated patterns like form fields or data rows.",
        tips: [
          "Train or prompt LLMs to output UI definitions directly in TOON format for faster streaming",
          "Define your component library schema in TOON and include it in system prompts",
          "Use TOON's array syntax for repeated components (form fields, list items, menu entries)",
          "Parse TOON output on the client and map to your component library for safe rendering",
          "Combine TOON UI definitions with streaming to show components as they're generated",
        ],
        promptExample: `Generate a dashboard UI for a sales analytics page. Use these components:
Card, Metric, BarChart, LineChart, Table, Button

Output format (application/autoon; profile="https://autoon.dev/generative-ui"):

type:ComponentType
props{key,key,...}:values
children[n]{type,props}:
  ComponentType,{propKey}:propValue
  ...

Example:
type:Card
props{title}:Sales Overview
children[2]{type,props}:
  Metric,{label,value,trend}:Revenue,$45\\,000,+12%
  Metric,{label,value,trend}:Orders,1\\,234,+8%

Generate a complete dashboard with key sales metrics and trends.`,
      }}
      jsonExample={jsonExample}
      toonExample={toonExample}
      previewType="generative-ui"
    />
  );
}
