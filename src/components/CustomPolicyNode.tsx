import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from './DelayDrawer';
import { PolicyNodeData } from '../store/useSystemStore';
import { useSystemStore } from '../store/useSystemStore';

export const CustomPolicyNode = ({ id, data }: { id: string, data: PolicyNodeData }) => {
  const isLit = data.status === 'LIT';
  const isCollapsed = data.status === 'COLLAPSED';
  const { setNodes, setEdges } = useReactFlow();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use ReactFlow instance to remove node and associated edges
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    
    // Also update global store
    useSystemStore.setState((state) => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
    }));
  };
  
  return (
    <div className={cn(
      "relative rounded-xl border-2 px-4 py-3 min-w-[140px] text-center shadow-sm transition-all duration-300 group",
      isLit && "bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-500/50 shadow-green-500/20",
      isCollapsed && "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-500/50 shadow-red-500/20",
      !isLit && !isCollapsed && "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100"
    )}>
      {/* Delete Button (visible on hover) */}
      <button 
        onClick={handleDelete}
        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Trash2 size={12} />
      </button>

      {/* Target Handle (Top) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 !-top-1.5" 
      />
      
      {/* Node Content */}
      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
        {data.title}
      </div>
      
      {/* Status indicator / Animation */}
      {isLit && (
        <motion.div 
          className="absolute -inset-1 rounded-xl border border-green-400/30 dark:border-green-500/30 z-[-1]"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {isCollapsed && (
        <motion.div 
          className="absolute -inset-1 rounded-xl border border-red-400/30 dark:border-red-500/30 z-[-1]"
          animate={{ x: [-2, 2, -2, 2, 0] }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Source Handle (Bottom) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 !-bottom-1.5" 
      />
    </div>
  );
};
