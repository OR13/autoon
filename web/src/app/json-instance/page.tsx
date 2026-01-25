import UseCaseDetailPage from '@/components/UseCaseDetailPage';

export const metadata = {
  title: 'JSON Instance - Autoon',
  description: 'Model JSON data instances using Toon format',
};

const jsonExample = `{
  "users": [
    {
      "id": "usr_001",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice@example.com",
      "role": "admin",
      "active": true
    },
    {
      "id": "usr_002",
      "firstName": "Bob",
      "lastName": "Smith",
      "email": "bob@example.com",
      "role": "user",
      "active": true
    },
    {
      "id": "usr_003",
      "firstName": "Carol",
      "lastName": "Williams",
      "email": "carol@example.com",
      "role": "user",
      "active": false
    }
  ]
}`;

const toonExample = `users[3]{id,firstName,lastName,email,role,active}:
  usr_001,Alice,Johnson,alice@example.com,admin,true
  usr_002,Bob,Smith,bob@example.com,user,true
  usr_003,Carol,Williams,carol@example.com,user,false`;

export default function JsonInstancePage() {
  return (
    <UseCaseDetailPage
      title="JSON Instance"
      subtitle="Represent structured data objects in a compact, tabular format ideal for LLM prompts"
      formatName="JSON"
      formatDescription="JSON (JavaScript Object Notation) is the de facto standard for data interchange on the web. It represents structured data as key-value pairs and arrays. While human-readable, JSON's syntax overhead (braces, brackets, quotes, colons) can make large datasets verbose and token-heavy, especially when many objects share the same structure."
      creator="Douglas Crockford"
      standardsBody="ECMA-404 / RFC 8259"
      standardsUrl="https://www.json.org/json-en.html"
      praise={[
        'Universal support - every programming language has JSON parsing',
        'Simple syntax that developers already understand',
        'Native to JavaScript and web APIs',
        'Human-readable without special tooling',
      ]}
      complaints={[
        'Repetitive keys waste space with arrays of similar objects',
        'No native support for comments or trailing commas',
        'Token-heavy for LLM applications with limited context windows',
        'Structural overhead dominates small data payloads',
      ]}
      mediaType='application/autoon; profile="https://autoon.dev/json-instance"'
      llmGuidance={{
        summary: "TOON's tabular format excels at representing arrays of objects with shared structure—exactly the pattern that dominates real-world data. When feeding data to LLMs for analysis, transformation, or querying, TOON can reduce token usage by 40-70% compared to equivalent JSON.",
        tips: [
          "Convert tabular data (CSV, database results, API responses) to TOON before including in prompts",
          "Use TOON when asking LLMs to analyze, filter, or transform lists of records",
          "Request LLM outputs in TOON format when expecting multiple similar objects",
          "For RAG applications, store document metadata in TOON to maximize retrievable context",
          "Batch similar API requests by encoding multiple inputs as TOON rows",
        ],
        promptExample: `Analyze the following user data and identify inactive accounts that haven't logged in recently:

Content-Type: application/autoon; profile="https://autoon.dev/json-instance"

users[5]{id,name,email,lastLogin,status}:
  u001,Alice Chen,alice@co.io,2024-01-15,active
  u002,Bob Smith,bob@co.io,2023-06-20,active
  u003,Carol Wu,carol@co.io,2024-01-10,active
  u004,Dan Lee,dan@co.io,2022-11-05,inactive
  u005,Eve Park,eve@co.io,2023-03-18,active

Return the results as TOON with columns: id, name, daysSinceLogin, recommendation`,
      }}
      jsonExample={jsonExample}
      toonExample={toonExample}
    />
  );
}
