import { AutoonDocument } from '@/types/autoon';

export const EXAMPLES: Record<string, AutoonDocument> = {
  class: {
    graph: {
      id: 'user-model',
      type: 'class',
      label: 'User Management Classes',
      directed: true,
      nodes: {
        User: { label: 'User', type: 'class' },
        id: { label: 'id: string', type: 'attribute' },
        email: { label: 'email: string', type: 'attribute' },
        role: { label: 'role: Role', type: 'attribute' },
        login: { label: 'login()', type: 'method' },
        Role: { label: 'Role', type: 'class' },
        Admin: { label: 'Admin', type: 'class' },
      },
      edges: [
        { source: 'User', target: 'id', relation: 'has' },
        { source: 'User', target: 'email', relation: 'has' },
        { source: 'User', target: 'role', relation: 'has' },
        { source: 'User', target: 'login', relation: 'has' },
        { source: 'User', target: 'Role', relation: 'uses' },
        { source: 'Admin', target: 'User', relation: 'inherits' },
      ],
    },
  },
  instance: {
    graph: {
      id: 'user-instances',
      type: 'instance',
      label: 'User Instances',
      directed: true,
      nodes: {
        alice: { label: 'alice: User', type: 'instance' },
        bob: { label: 'bob: User', type: 'instance' },
        adminRole: { label: 'admin: Role', type: 'instance' },
      },
      edges: [
        { source: 'alice', target: 'adminRole', relation: 'has', label: 'role' },
      ],
    },
  },
  process: {
    graph: {
      id: 'login-process',
      type: 'process',
      label: 'Login Process',
      directed: true,
      nodes: {
        start: { label: 'Start', type: 'start' },
        enterCreds: { label: 'Enter Credentials', type: 'action' },
        validate: { label: 'Valid?', type: 'decision' },
        success: { label: 'Login Success', type: 'state' },
        failure: { label: 'Login Failed', type: 'state' },
        end: { label: 'End', type: 'end' },
      },
      edges: [
        { source: 'start', target: 'enterCreds', relation: 'flows' },
        { source: 'enterCreds', target: 'validate', relation: 'flows' },
        { source: 'validate', target: 'success', relation: 'guards', label: 'yes' },
        { source: 'validate', target: 'failure', relation: 'guards', label: 'no' },
        { source: 'success', target: 'end', relation: 'flows' },
        { source: 'failure', target: 'enterCreds', relation: 'flows' },
      ],
    },
  },
  workflow: {
    graph: {
      id: 'order-workflow',
      type: 'workflow',
      label: 'Order Processing',
      directed: true,
      nodes: {
        start: { label: 'Order Received', type: 'start' },
        fork1: { label: 'Fork', type: 'fork' },
        payment: { label: 'Process Payment', type: 'action' },
        inventory: { label: 'Check Inventory', type: 'action' },
        join1: { label: 'Join', type: 'join' },
        ship: { label: 'Ship Order', type: 'action' },
        end: { label: 'Complete', type: 'end' },
      },
      edges: [
        { source: 'start', target: 'fork1', relation: 'flows' },
        { source: 'fork1', target: 'payment', relation: 'flows' },
        { source: 'fork1', target: 'inventory', relation: 'flows' },
        { source: 'payment', target: 'join1', relation: 'flows' },
        { source: 'inventory', target: 'join1', relation: 'flows' },
        { source: 'join1', target: 'ship', relation: 'flows' },
        { source: 'ship', target: 'end', relation: 'flows' },
      ],
    },
  },
};
