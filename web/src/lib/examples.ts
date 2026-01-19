// Example categories
export type ExampleCategory = 'schema' | 'instance' | 'jsonrender' | 'litegraph';

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

// TOON format: direct representation of the JSON Schema
const personSchemaToon = `schema{$id,$schema,title,type,additionalProperties}:
  https://example.com/person.schema.json,https://json-schema.org/draft/2020-12/schema,Person,object,false

properties[7]{name,type,description,minimum,format,pattern,default}:
  firstName,string,The person's first name.,,,,
  lastName,string,The person's last name.,,,,
  age,integer,Age in years which must be equal to or greater than zero.,0,,,
  email,string,,,,email,,
  phone,string,,,,^\\+?[0-9]{10,14}$,
  address,object,,,,,
  isActive,boolean,,,,,,true

required[2]:
  firstName
  lastName`;

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

const productSchemaToon = `schema{$id,$schema,title,type}:
  https://example.com/product.schema.json,https://json-schema.org/draft/2020-12/schema,Product,object

properties[6]{name,type,format,minLength,minimum,enum,default,uniqueItems}:
  id,string,uuid,,,,,
  name,string,,1,,,,
  price,number,,,0,,,
  category,string,,,,electronics|clothing|food|other,,
  inStock,boolean,,,,,true,
  tags,array,,,,,,true

required[3]:
  id
  name
  price`;

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

const personInstanceToon = `person{firstName,lastName,age,email,isActive}:
  John,Doe,30,john.doe@example.com,true`;

const personInstanceJson = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  email: 'john.doe@example.com',
  isActive: true,
};

const productInstanceToon = `product{id,name,price,category,inStock,tags}:
  550e8400-e29b-41d4-a716-446655440000,Wireless Headphones,79.99,electronics,true,["audio","wireless","bluetooth"]`;

const productInstanceJson = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Wireless Headphones',
  price: 79.99,
  category: 'electronics',
  inStock: true,
  tags: ['audio', 'wireless', 'bluetooth'],
};

// ============================================
// JSON Render Examples (Vercel AI UI Components)
// ============================================

const dashboardRenderToon = `component{type,title}:
  Card,Revenue Dashboard

children[3]{type,label,value,trend,data}:
  Metric,Total Revenue,$125430,+12.5%,
  Metric,Active Users,2847,+5.2%,
  BarChart,,,,{"data":[{"month":"Jan","value":4000},{"month":"Feb","value":3000},{"month":"Mar","value":5000}]}`;

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

const formRenderToon = `component{type,title,action}:
  Form,Contact Us,submit-contact

children[6]{type,name,label,required,type2,rows,options,variant}:
  TextInput,name,Full Name,true,,,,
  TextInput,email,Email,true,email,,,
  Select,subject,Subject,,,,"General|Support|Sales",
  TextArea,message,Message,,,4,,
  Checkbox,subscribe,Subscribe to newsletter,,,,,
  Button,,,,,,,primary`;

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
// LiteGraph/ComfyUI Examples
// ============================================

const simpleWorkflowToon = `workflow{version,lastNodeId,lastLinkId}:
  1,4,4

nodes[4]{id,type,pos_x,pos_y,widgets_values}:
  1,CheckpointLoaderSimple,50,200,["v1-5-pruned.safetensors"]
  2,CLIPTextEncode,300,100,["a beautiful sunset over mountains"]
  3,CLIPTextEncode,300,300,["blurry, bad quality"]
  4,KSampler,550,200,["euler",20,8,1234]

links[5]{id,origin_id,origin_slot,target_id,target_slot,type}:
  1,1,0,4,0,MODEL
  2,1,1,2,0,CLIP
  3,1,1,3,0,CLIP
  4,2,0,4,1,CONDITIONING
  5,3,0,4,2,CONDITIONING`;

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

const img2imgWorkflowToon = `workflow{version,lastNodeId,lastLinkId}:
  1,6,8

nodes[6]{id,type,pos_x,pos_y,widgets_values}:
  1,LoadImage,50,150,["input.png"]
  2,CheckpointLoaderSimple,50,350,["v1-5-pruned.safetensors"]
  3,VAEEncode,300,150,[]
  4,CLIPTextEncode,300,300,["cyberpunk city, neon lights, futuristic"]
  5,KSampler,550,200,["euler",20,7,42,0.75]
  6,VAEDecode,800,200,[]

links[8]{id,origin_id,origin_slot,target_id,target_slot,type}:
  1,1,0,3,0,IMAGE
  2,2,0,5,0,MODEL
  3,2,1,4,0,CLIP
  4,2,2,3,1,VAE
  5,3,0,5,3,LATENT
  6,4,0,5,1,CONDITIONING
  7,5,0,6,0,LATENT
  8,2,2,6,1,VAE`;

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
    toon: personSchemaToon,
    json: personSchemaJson,
  },
  {
    id: 'product-schema',
    name: 'Product Schema',
    category: 'schema',
    toon: productSchemaToon,
    json: productSchemaJson,
  },
  // Instance examples
  {
    id: 'person-instance',
    name: 'Person Instance',
    category: 'instance',
    toon: personInstanceToon,
    json: personInstanceJson,
  },
  {
    id: 'product-instance',
    name: 'Product Instance',
    category: 'instance',
    toon: productInstanceToon,
    json: productInstanceJson,
  },
  // JSON Render examples
  {
    id: 'dashboard-render',
    name: 'Dashboard UI',
    category: 'jsonrender',
    toon: dashboardRenderToon,
    json: dashboardRenderJson,
  },
  {
    id: 'form-render',
    name: 'Contact Form',
    category: 'jsonrender',
    toon: formRenderToon,
    json: formRenderJson,
  },
  // LiteGraph examples
  {
    id: 'simple-workflow',
    name: 'Simple Workflow',
    category: 'litegraph',
    toon: simpleWorkflowToon,
    json: simpleWorkflowJson,
  },
  {
    id: 'img2img-workflow',
    name: 'Img2Img Workflow',
    category: 'litegraph',
    toon: img2imgWorkflowToon,
    json: img2imgWorkflowJson,
  },
];

export const EXAMPLE_CATEGORIES: { id: ExampleCategory; name: string }[] = [
  { id: 'schema', name: 'JSON Schema' },
  { id: 'instance', name: 'JSON Instance' },
  { id: 'jsonrender', name: 'JSON Render' },
  { id: 'litegraph', name: 'LiteGraph' },
];

// Helper to get examples by category
export function getExamplesByCategory(category: ExampleCategory): Example[] {
  return EXAMPLES.filter((e) => e.category === category);
}

// Helper to detect JSON type from content
export function detectJsonType(json: Record<string, unknown>): ExampleCategory {
  // Check for LiteGraph/ComfyUI format
  if (json.nodes && json.links && (json.version !== undefined || json.state)) {
    return 'litegraph';
  }

  // Check for JSON Render format
  if (json.type && json.props && typeof json.type === 'string') {
    return 'jsonrender';
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
