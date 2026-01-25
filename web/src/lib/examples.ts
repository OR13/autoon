import { encode } from '@toon-format/toon';

// Example categories
export type ExampleCategory = 'schema' | 'instance' | 'generative-ui' | 'nodal-ui';

// Schema graph type for GraphEditor
export interface SchemaGraphNode {
  label: string;
  type?: 'object' | 'property' | 'type' | 'constraint';
}

export interface SchemaGraphEdge {
  source: string;
  target: string;
  relation?: string;
}

export interface SchemaGraph {
  nodes: Record<string, SchemaGraphNode>;
  edges: SchemaGraphEdge[];
}

export interface Example {
  id: string;
  name: string;
  category: ExampleCategory;
  toon: string;
  json: Record<string, unknown>;
}

// ============================================
// JSON Schema Examples
// ============================================

const personSchemaJson = {
  $id: 'https://example.com/person.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Person',
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      description: "The person's first name.",
    },
    lastName: {
      type: 'string',
      description: "The person's last name.",
    },
    age: {
      description: 'Age in years which must be equal to or greater than zero.',
      type: 'integer',
      minimum: 0,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    phone: {
      type: 'string',
      pattern: '^\\+?[0-9]{10,14}$',
    },
    address: {
      type: 'object',
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
  },
  required: ['firstName', 'lastName'],
  additionalProperties: false,
};

const productSchemaJson = {
  $id: 'https://example.com/product.schema.json',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Product',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    price: {
      type: 'number',
      minimum: 0,
    },
    category: {
      type: 'string',
      enum: ['electronics', 'clothing', 'food', 'other'],
    },
    inStock: {
      type: 'boolean',
      default: true,
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
  },
  required: ['id', 'name', 'price'],
};

// ============================================
// JSON Instance Examples
// ============================================

const personInstanceJson = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  email: 'john.doe@example.com',
  isActive: true,
};

const productInstanceJson = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Wireless Headphones',
  price: 79.99,
  category: 'electronics',
  inStock: true,
  tags: ['audio', 'wireless', 'bluetooth'],
};

// ============================================
// Generative UI Examples (Vercel AI UI Components)
// ============================================

const dashboardRenderJson = {
  type: 'Card',
  props: { title: 'Revenue Dashboard' },
  children: [
    {
      type: 'Metric',
      props: { label: 'Total Revenue', value: '$125,430', trend: '+12.5%' },
    },
    {
      type: 'Metric',
      props: { label: 'Active Users', value: '2,847', trend: '+5.2%' },
    },
    {
      type: 'BarChart',
      props: {
        data: [
          { month: 'Jan', value: 4000 },
          { month: 'Feb', value: 3000 },
          { month: 'Mar', value: 5000 },
        ],
      },
    },
  ],
};

const formRenderJson = {
  type: 'Form',
  props: { title: 'Contact Us', action: 'submit-contact' },
  children: [
    {
      type: 'TextInput',
      props: { name: 'name', label: 'Full Name', required: true },
    },
    {
      type: 'TextInput',
      props: { name: 'email', label: 'Email', type: 'email', required: true },
    },
    {
      type: 'Select',
      props: {
        name: 'subject',
        label: 'Subject',
        options: ['General', 'Support', 'Sales'],
      },
    },
    {
      type: 'TextArea',
      props: { name: 'message', label: 'Message', rows: 4 },
    },
    {
      type: 'Checkbox',
      props: { name: 'subscribe', label: 'Subscribe to newsletter' },
    },
    {
      type: 'Button',
      props: { label: 'Send Message', type: 'submit', variant: 'primary' },
    },
  ],
};

// ============================================
// Nodal UI Examples (LiteGraph/ComfyUI)
// ============================================

const simpleWorkflowJson = {
  version: 1,
  config: {
    links_ontop: false,
    align_to_grid: false,
  },
  state: {
    lastNodeId: 4,
    lastLinkId: 4,
  },
  nodes: [
    {
      id: 1,
      type: 'CheckpointLoaderSimple',
      pos: [50, 200],
      size: [200, 100],
      properties: { 'Node name for S&R': 'CheckpointLoaderSimple' },
      widgets_values: ['v1-5-pruned.safetensors'],
      outputs: [
        { name: 'MODEL', type: 'MODEL', links: [1] },
        { name: 'CLIP', type: 'CLIP', links: [2, 3] },
        { name: 'VAE', type: 'VAE', links: null },
      ],
    },
    {
      id: 2,
      type: 'CLIPTextEncode',
      pos: [300, 100],
      size: [200, 80],
      properties: { 'Node name for S&R': 'CLIPTextEncode' },
      widgets_values: ['a beautiful sunset over mountains'],
      inputs: [{ name: 'clip', type: 'CLIP', link: 2 }],
      outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING', links: [4] }],
    },
    {
      id: 3,
      type: 'CLIPTextEncode',
      pos: [300, 300],
      size: [200, 80],
      properties: { 'Node name for S&R': 'CLIPTextEncode' },
      widgets_values: ['blurry, bad quality'],
      inputs: [{ name: 'clip', type: 'CLIP', link: 3 }],
      outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING', links: [5] }],
    },
    {
      id: 4,
      type: 'KSampler',
      pos: [550, 200],
      size: [200, 150],
      properties: { 'Node name for S&R': 'KSampler' },
      widgets_values: ['euler', 20, 8, 1234],
      inputs: [
        { name: 'model', type: 'MODEL', link: 1 },
        { name: 'positive', type: 'CONDITIONING', link: 4 },
        { name: 'negative', type: 'CONDITIONING', link: 5 },
      ],
      outputs: [{ name: 'LATENT', type: 'LATENT', links: null }],
    },
  ],
  links: [
    { id: 1, origin_id: 1, origin_slot: 0, target_id: 4, target_slot: 0, type: 'MODEL' },
    { id: 2, origin_id: 1, origin_slot: 1, target_id: 2, target_slot: 0, type: 'CLIP' },
    { id: 3, origin_id: 1, origin_slot: 1, target_id: 3, target_slot: 0, type: 'CLIP' },
    { id: 4, origin_id: 2, origin_slot: 0, target_id: 4, target_slot: 1, type: 'CONDITIONING' },
    { id: 5, origin_id: 3, origin_slot: 0, target_id: 4, target_slot: 2, type: 'CONDITIONING' },
  ],
};

const img2imgWorkflowJson = {
  version: 1,
  config: {
    links_ontop: false,
    align_to_grid: false,
  },
  state: {
    lastNodeId: 6,
    lastLinkId: 8,
  },
  nodes: [
    {
      id: 1,
      type: 'LoadImage',
      pos: [50, 150],
      size: [150, 80],
      widgets_values: ['input.png'],
      outputs: [
        { name: 'IMAGE', type: 'IMAGE', links: [1] },
        { name: 'MASK', type: 'MASK', links: null },
      ],
    },
    {
      id: 2,
      type: 'CheckpointLoaderSimple',
      pos: [50, 350],
      size: [200, 100],
      widgets_values: ['v1-5-pruned.safetensors'],
      outputs: [
        { name: 'MODEL', type: 'MODEL', links: [2] },
        { name: 'CLIP', type: 'CLIP', links: [3] },
        { name: 'VAE', type: 'VAE', links: [4, 8] },
      ],
    },
    {
      id: 3,
      type: 'VAEEncode',
      pos: [300, 150],
      size: [150, 60],
      widgets_values: [],
      inputs: [
        { name: 'pixels', type: 'IMAGE', link: 1 },
        { name: 'vae', type: 'VAE', link: 4 },
      ],
      outputs: [{ name: 'LATENT', type: 'LATENT', links: [5] }],
    },
    {
      id: 4,
      type: 'CLIPTextEncode',
      pos: [300, 300],
      size: [200, 80],
      widgets_values: ['cyberpunk city, neon lights, futuristic'],
      inputs: [{ name: 'clip', type: 'CLIP', link: 3 }],
      outputs: [{ name: 'CONDITIONING', type: 'CONDITIONING', links: [6] }],
    },
    {
      id: 5,
      type: 'KSampler',
      pos: [550, 200],
      size: [200, 150],
      widgets_values: ['euler', 20, 7, 42, 0.75],
      inputs: [
        { name: 'model', type: 'MODEL', link: 2 },
        { name: 'positive', type: 'CONDITIONING', link: 6 },
        { name: 'negative', type: 'CONDITIONING', link: null },
        { name: 'latent_image', type: 'LATENT', link: 5 },
      ],
      outputs: [{ name: 'LATENT', type: 'LATENT', links: [7] }],
    },
    {
      id: 6,
      type: 'VAEDecode',
      pos: [800, 200],
      size: [150, 60],
      widgets_values: [],
      inputs: [
        { name: 'samples', type: 'LATENT', link: 7 },
        { name: 'vae', type: 'VAE', link: 8 },
      ],
      outputs: [{ name: 'IMAGE', type: 'IMAGE', links: null }],
    },
  ],
  links: [
    { id: 1, origin_id: 1, origin_slot: 0, target_id: 3, target_slot: 0, type: 'IMAGE' },
    { id: 2, origin_id: 2, origin_slot: 0, target_id: 5, target_slot: 0, type: 'MODEL' },
    { id: 3, origin_id: 2, origin_slot: 1, target_id: 4, target_slot: 0, type: 'CLIP' },
    { id: 4, origin_id: 2, origin_slot: 2, target_id: 3, target_slot: 1, type: 'VAE' },
    { id: 5, origin_id: 3, origin_slot: 0, target_id: 5, target_slot: 3, type: 'LATENT' },
    { id: 6, origin_id: 4, origin_slot: 0, target_id: 5, target_slot: 1, type: 'CONDITIONING' },
    { id: 7, origin_id: 5, origin_slot: 0, target_id: 6, target_slot: 0, type: 'LATENT' },
    { id: 8, origin_id: 2, origin_slot: 2, target_id: 6, target_slot: 1, type: 'VAE' },
  ],
};

// ============================================
// All Examples Collection
// ============================================

export const EXAMPLES: Example[] = [
  // Schema examples
  {
    id: 'person-schema',
    name: 'Person Schema',
    category: 'schema',
    toon: encode(personSchemaJson),
    json: personSchemaJson,
  },
  {
    id: 'product-schema',
    name: 'Product Schema',
    category: 'schema',
    toon: encode(productSchemaJson),
    json: productSchemaJson,
  },
  // Instance examples
  {
    id: 'person-instance',
    name: 'Person Instance',
    category: 'instance',
    toon: encode(personInstanceJson),
    json: personInstanceJson,
  },
  {
    id: 'product-instance',
    name: 'Product Instance',
    category: 'instance',
    toon: encode(productInstanceJson),
    json: productInstanceJson,
  },
  // Generative UI examples
  {
    id: 'dashboard-render',
    name: 'Dashboard UI',
    category: 'generative-ui',
    toon: encode(dashboardRenderJson),
    json: dashboardRenderJson,
  },
  {
    id: 'form-render',
    name: 'Contact Form',
    category: 'generative-ui',
    toon: encode(formRenderJson),
    json: formRenderJson,
  },
  // Nodal UI examples
  {
    id: 'simple-workflow',
    name: 'Simple Workflow',
    category: 'nodal-ui',
    toon: encode(simpleWorkflowJson),
    json: simpleWorkflowJson,
  },
  {
    id: 'img2img-workflow',
    name: 'Img2Img Workflow',
    category: 'nodal-ui',
    toon: encode(img2imgWorkflowJson),
    json: img2imgWorkflowJson,
  },
];

export const EXAMPLE_CATEGORIES: { id: ExampleCategory; name: string }[] = [
  { id: 'schema', name: 'JSON Schema' },
  { id: 'instance', name: 'JSON Instance' },
  { id: 'generative-ui', name: 'Generative UI' },
  { id: 'nodal-ui', name: 'Nodal UI' },
];

// Helper to get examples by category
export function getExamplesByCategory(category: ExampleCategory): Example[] {
  return EXAMPLES.filter((e) => e.category === category);
}

// Helper to detect JSON type from content
export function detectJsonType(json: Record<string, unknown>): ExampleCategory {
  // Check for Nodal UI format (LiteGraph/ComfyUI)
  if (json.nodes && json.links && (json.version !== undefined || json.state)) {
    return 'nodal-ui';
  }

  // Check for Generative UI format
  if (json.type && json.props && typeof json.type === 'string') {
    return 'generative-ui';
  }

  // Check for JSON Schema
  if (json.$schema || json.properties || json.type === 'object' || json.type === 'array') {
    if (json.$schema || json.properties) {
      return 'schema';
    }
  }

  // Default to instance
  return 'instance';
}
