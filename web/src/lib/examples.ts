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

const personSchemaToon = `graph{id,type,label}:
  person-schema,schema,Person Schema

nodes[8]{id,label,type,dataType,constraints}:
  root,Person,object,,
  firstName,firstName,property,string,
  lastName,lastName,property,string,
  age,age,property,integer,minimum:0
  email,email,property,string,format:email
  phone,phone,property,string,pattern:^\\+?[0-9]{10,14}$
  address,address,property,object,
  isActive,isActive,property,boolean,default:true

edges[7]{source,target,relation}:
  root,firstName,has_property
  root,lastName,has_property
  root,age,has_property
  root,email,has_property
  root,phone,has_property
  root,address,has_property
  root,isActive,has_property

metadata:
  required: firstName,lastName
  additionalProperties: false`;

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

const productSchemaToon = `graph{id,type,label}:
  product-schema,schema,Product Schema

nodes[7]{id,label,type,dataType,constraints}:
  root,Product,object,,
  id,id,property,string,format:uuid
  name,name,property,string,minLength:1
  price,price,property,number,minimum:0
  category,category,property,string,enum:electronics|clothing|food|other
  inStock,inStock,property,boolean,default:true
  tags,tags,property,array,items:string|uniqueItems:true

edges[6]{source,target,relation}:
  root,id,has_property
  root,name,has_property
  root,price,has_property
  root,category,has_property
  root,inStock,has_property
  root,tags,has_property

metadata:
  required: id,name,price`;

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

const personInstanceToon = `graph{id,type,label}:
  person-instance,instance,John Doe

nodes[5]{id,label,value}:
  firstName,firstName,John
  lastName,lastName,Doe
  age,age,30
  email,email,john.doe@example.com
  isActive,isActive,true`;

const personInstanceJson = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  email: 'john.doe@example.com',
  isActive: true,
};

const productInstanceToon = `graph{id,type,label}:
  product-instance,instance,Wireless Headphones

nodes[6]{id,label,value}:
  id,id,550e8400-e29b-41d4-a716-446655440000
  name,name,Wireless Headphones
  price,price,79.99
  category,category,electronics
  inStock,inStock,true
  tags,tags,["audio","wireless","bluetooth"]`;

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

const dashboardRenderToon = `graph{id,type,label}:
  dashboard,jsonrender,Revenue Dashboard

nodes[6]{id,type,props,children}:
  card1,Card,{"title":"Revenue Dashboard"},metric1|metric2|chart1
  metric1,Metric,{"label":"Total Revenue","value":"$125,430","trend":"+12.5%"},
  metric2,Metric,{"label":"Active Users","value":"2,847","trend":"+5.2%"},
  chart1,BarChart,{"data":[{"month":"Jan","value":4000},{"month":"Feb","value":3000},{"month":"Mar","value":5000}]},
  alert1,Alert,{"variant":"success","message":"Q1 targets exceeded by 15%"},
  button1,Button,{"label":"View Details","action":{"name":"navigate","params":{"to":"/reports"}}}

edges[3]{source,target,relation}:
  card1,metric1,contains
  card1,metric2,contains
  card1,chart1,contains`;

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

const formRenderToon = `graph{id,type,label}:
  contact-form,jsonrender,Contact Form

nodes[7]{id,type,props}:
  form1,Form,{"title":"Contact Us","action":"submit-contact"}
  input1,TextInput,{"name":"name","label":"Full Name","required":true}
  input2,TextInput,{"name":"email","label":"Email","type":"email","required":true}
  input3,TextArea,{"name":"message","label":"Message","rows":4}
  select1,Select,{"name":"subject","label":"Subject","options":["General","Support","Sales"]}
  checkbox1,Checkbox,{"name":"subscribe","label":"Subscribe to newsletter"}
  submit1,Button,{"label":"Send Message","type":"submit","variant":"primary"}

edges[6]{source,target,relation}:
  form1,input1,contains
  form1,input2,contains
  form1,select1,contains
  form1,input3,contains
  form1,checkbox1,contains
  form1,submit1,contains`;

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

const simpleWorkflowToon = `graph{id,type,label,version}:
  simple-workflow,litegraph,Simple Image Generation,1

nodes[4]{id,type,pos_x,pos_y,widgets_values}:
  1,CheckpointLoaderSimple,50,200,["v1-5-pruned.safetensors"]
  2,CLIPTextEncode,300,100,["a beautiful sunset over mountains"]
  3,CLIPTextEncode,300,300,["blurry, bad quality"]
  4,KSampler,550,200,["euler",20,8,1234]

edges[4]{source,source_slot,target,target_slot}:
  1,0,4,0
  1,1,2,0
  1,1,3,0
  2,0,4,1
  3,0,4,2`;

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

const img2imgWorkflowToon = `graph{id,type,label,version}:
  img2img-workflow,litegraph,Image to Image,1

nodes[6]{id,type,pos_x,pos_y,widgets_values}:
  1,LoadImage,50,150,["input.png"]
  2,CheckpointLoaderSimple,50,350,["v1-5-pruned.safetensors"]
  3,VAEEncode,300,150,[]
  4,CLIPTextEncode,300,300,["cyberpunk city, neon lights, futuristic"]
  5,KSampler,550,200,["euler",20,7,42,0.75]
  6,VAEDecode,800,200,[]

edges[6]{source,source_slot,target,target_slot}:
  1,0,3,0
  2,0,5,0
  2,1,4,0
  2,2,3,1
  3,0,5,3
  4,0,5,1
  5,0,6,0
  2,2,6,1`;

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

// ============================================
// Legacy exports for backward compatibility
// ============================================

export const SCHEMA_EXAMPLES = {
  person: personSchemaJson,
  product: productSchemaJson,
  address: {
    $id: 'https://example.com/address.schema.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Address',
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string', minLength: 2, maxLength: 2 },
      zipCode: { type: 'string', pattern: '^[0-9]{5}(-[0-9]{4})?$' },
      country: { type: 'string', default: 'USA' },
    },
    required: ['street', 'city', 'state', 'zipCode'],
  },
};

export const INSTANCE_EXAMPLES = {
  person: personInstanceJson,
  product: productInstanceJson,
  address: {
    street: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
  },
};

// Graph representation of schema structure
export interface SchemaGraphNode {
  id: string;
  label: string;
  type: 'object' | 'property' | 'type' | 'constraint';
  data?: Record<string, unknown>;
}

export interface SchemaGraphEdge {
  source: string;
  target: string;
  relation: 'has_property' | 'has_type' | 'has_constraint';
  label?: string;
}

export interface SchemaGraph {
  nodes: Record<string, SchemaGraphNode>;
  edges: SchemaGraphEdge[];
}

// Convert JSON Schema to graph representation
export function schemaToGraph(schema: Record<string, unknown>): SchemaGraph {
  const graph: SchemaGraph = { nodes: {}, edges: [] };
  let nodeId = 0;

  const rootId = `node_${nodeId++}`;
  graph.nodes[rootId] = {
    id: rootId,
    label: (schema.title as string) || 'Root',
    type: 'object',
  };

  const properties = schema.properties as Record<string, Record<string, unknown>> | undefined;
  if (properties) {
    for (const [propName, propSchema] of Object.entries(properties)) {
      const propId = `node_${nodeId++}`;
      graph.nodes[propId] = {
        id: propId,
        label: propName,
        type: 'property',
        data: propSchema,
      };
      graph.edges.push({
        source: rootId,
        target: propId,
        relation: 'has_property',
      });

      // Add type node
      const typeValue = propSchema.type as string | undefined;
      if (typeValue) {
        const typeId = `node_${nodeId++}`;
        graph.nodes[typeId] = {
          id: typeId,
          label: typeValue,
          type: 'type',
        };
        graph.edges.push({
          source: propId,
          target: typeId,
          relation: 'has_type',
        });
      }

      // Add constraints
      const constraints: string[] = [];
      if (propSchema.minimum !== undefined) constraints.push(`min: ${propSchema.minimum}`);
      if (propSchema.maximum !== undefined) constraints.push(`max: ${propSchema.maximum}`);
      if (propSchema.minLength !== undefined) constraints.push(`minLen: ${propSchema.minLength}`);
      if (propSchema.maxLength !== undefined) constraints.push(`maxLen: ${propSchema.maxLength}`);
      if (propSchema.pattern) constraints.push(`pattern`);
      if (propSchema.format) constraints.push(`format: ${propSchema.format}`);
      if (propSchema.enum) constraints.push(`enum`);

      if (constraints.length > 0) {
        const constraintId = `node_${nodeId++}`;
        graph.nodes[constraintId] = {
          id: constraintId,
          label: constraints.join(', '),
          type: 'constraint',
        };
        graph.edges.push({
          source: propId,
          target: constraintId,
          relation: 'has_constraint',
        });
      }
    }
  }

  return graph;
}
