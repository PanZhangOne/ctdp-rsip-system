import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { Edge, Node, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, addEdge } from '@xyflow/react';

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export type NodeStatus = 'UNLIT' | 'LIT' | 'COLLAPSED';

export interface PolicyNodeData extends Record<string, unknown> {
  policyId: string;
  title: string;
  status: NodeStatus;
  litDate?: number;
}

export type PolicyNode = Node<PolicyNodeData>;

interface SystemState {
  nodes: PolicyNode[];
  edges: Edge[];
  
  onNodesChange: (changes: NodeChange<PolicyNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (node: PolicyNode) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  
  // Collapse handling
  collapseNodeAndDescendants: (nodeId: string) => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as PolicyNode[],
        });
      },
      
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      
      onConnect: (connection) => {
        set({
          edges: addEdge({ ...connection, animated: true, style: { stroke: '#a1a1aa', strokeWidth: 2 } }, get().edges),
        });
      },

      addNode: (node) => {
        set({
          nodes: [...get().nodes, node]
        });
      },

      updateNodeStatus: (nodeId, status) => {
        set((state) => ({
          nodes: state.nodes.map(n => {
            if (n.id === nodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  status,
                  litDate: status === 'LIT' && n.data.status !== 'LIT' ? Date.now() : n.data.litDate
                }
              };
            }
            return n;
          })
        }));
      },

      collapseNodeAndDescendants: (nodeId) => {
        const state = get();
        const edges = state.edges;
        const nodesToCollapse = new Set<string>([nodeId]);
        
        // Find all descendants recursively
        let added = true;
        while(added) {
          added = false;
          edges.forEach(edge => {
            if (nodesToCollapse.has(edge.source) && !nodesToCollapse.has(edge.target)) {
              nodesToCollapse.add(edge.target);
              added = true;
            }
          });
        }

        set((state) => ({
          nodes: state.nodes.map(n => {
            if (nodesToCollapse.has(n.id)) {
              return {
                ...n,
                data: {
                  ...n.data,
                  // Original node gets 'COLLAPSED', descendants get 'UNLIT'
                  status: n.id === nodeId ? 'COLLAPSED' : 'UNLIT'
                }
              };
            }
            return n;
          })
        }));
      }
    }),
    {
      name: 'system-tree-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
