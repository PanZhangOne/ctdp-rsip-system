import React, { useState, useMemo } from 'react';
import { ReactFlow, Controls, Background, NodeTypes, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Target, RotateCcw, X, TrendingUp, Layers, Activity, Plus, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSystemStore, PolicyNode } from '../store/useSystemStore';
import { usePolicyStore } from '../store/usePolicyStore';
import { CustomPolicyNode } from '../components/CustomPolicyNode';
import { cn } from '../components/DelayDrawer';

const nodeTypes: NodeTypes = {
  policyNode: CustomPolicyNode,
};

const SystemPageContent = () => {
  const navigate = useNavigate();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, updateNodeStatus, collapseNodeAndDescendants, addNode } = useSystemStore();
  const { policies } = usePolicyStore();
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<PolicyNode | null>(null);
  const [isCollapseDialogOpen, setIsCollapseDialogOpen] = useState(false);
  const [isAddNodeDrawerOpen, setIsAddNodeDrawerOpen] = useState(false);

  // Computed Steady State Metrics
  const litCount = nodes.filter(n => n.data.status === 'LIT').length;
  const totalCount = nodes.length;
  const steadyIndex = totalCount === 0 ? 0 : Math.round((litCount / totalCount) * 100);

  // Calculate Max Root Node Days
  const maxRootDays = useMemo(() => {
    // Find root nodes (no incoming edges)
    const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
    if (rootNodes.length === 0) return 0;
    
    // Find the max days a lit root node has been lit
    let maxDays = 0;
    const now = Date.now();
    rootNodes.forEach(n => {
      if (n.data.status === 'LIT' && n.data.litDate) {
        const days = Math.floor((now - n.data.litDate) / (1000 * 60 * 60 * 24));
        if (days > maxDays) maxDays = days;
      }
    });
    // Add 1 to represent "Day 1" if it's lit today
    return rootNodes.some(n => n.data.status === 'LIT') ? maxDays + 1 : 0;
  }, [nodes, edges]);
  
  // Handlers
  const handleNodeClick = (event: React.MouseEvent, node: any) => {
    setSelectedNode(node as PolicyNode);
  };

  const handleLightNode = () => {
    if (selectedNode) {
      updateNodeStatus(selectedNode.id, 'LIT');
      setSelectedNode(null);
    }
  };

  const handleTriggerCollapse = () => {
    setIsCollapseDialogOpen(true);
  };

  const confirmCollapse = (reason: string) => {
    if (selectedNode) {
      collapseNodeAndDescendants(selectedNode.id);
      
      // If the reason implies policy needs tuning, we can redirect or show a prompt
      if (reason === '动作成本太高' || reason === '触发器忘了') {
        // Navigate to policies page to edit the specific policy
        navigate('/policies');
      } else {
        setIsCollapseDialogOpen(false);
        setSelectedNode(null);
      }
    }
  };

  // Check if a node can be lit (all parents must be LIT)
  const canLightNode = useMemo(() => {
    if (!selectedNode) return false;
    const parentEdges = edges.filter(e => e.target === selectedNode.id);
    if (parentEdges.length === 0) return true; // root node
    
    return parentEdges.every(e => {
      const parentNode = nodes.find(n => n.id === e.source);
      return parentNode?.data.status === 'LIT';
    });
  }, [selectedNode, edges, nodes]);

  // Handle adding new node from existing policies
  const handleAddPolicyToTree = (policyId: string, title: string) => {
    // Add to center of the current view
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    
    // Add a slight random offset to prevent stacking
    position.x += (Math.random() - 0.5) * 50;
    position.y += (Math.random() - 0.5) * 50;

    const newNode = {
      id: crypto.randomUUID(),
      type: 'policyNode',
      position,
      data: {
        policyId,
        title,
        status: 'UNLIT' as const,
      },
    };
    addNode(newNode);
    setIsAddNodeDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] text-zinc-900 dark:text-zinc-100 pb-16 transition-colors">
      {/* Background Ambience / Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-black dark:to-black -z-10 transition-colors pointer-events-none" />

      {/* Dashboard Header */}
      <div className="shrink-0 glass-panel z-10 px-6 pt-14 pb-5 shadow-sm transition-colors border-b-0 rounded-b-[2.5rem]">
        <h1 className="text-2xl font-semibold mb-5 tracking-tight">体系稳态</h1>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 flex items-center justify-between transition-colors col-span-2 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_16px_-6px_rgba(0,0,0,0.4)]">
            <div>
              <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1">稳态指数</div>
              <div className="text-3xl font-light tabular-nums flex items-baseline">
                {Number.isNaN(steadyIndex) ? 0 : steadyIndex}<span className="text-sm text-zinc-500 ml-1">%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center relative">
              <svg className="w-full h-full transform -rotate-90 absolute inset-0 drop-shadow-md">
                <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500" strokeDasharray="113" strokeDashoffset={113 - (113 * (Number.isNaN(steadyIndex) ? 0 : steadyIndex)) / 100} strokeLinecap="round" />
              </svg>
              <Activity size={18} className="text-blue-500" />
            </div>
          </div>

          <div className="glass-card bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/20 dark:border-blue-500/20 p-4 flex flex-col justify-center transition-colors shadow-[0_8px_16px_-6px_rgba(59,130,246,0.1)]">
            <div className="text-blue-600 dark:text-blue-400 text-xs font-medium mb-1 line-clamp-1">根节点稳态</div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-medium text-blue-700 dark:text-blue-300">{maxRootDays}</span>
              <span className="text-xs text-blue-500 dark:text-blue-500">天</span>
            </div>
          </div>
        </div>

        <div className="mt-3 glass-card bg-white/40 dark:bg-zinc-800/30 px-4 py-3 flex items-center justify-between transition-colors shadow-sm">
          <div className="flex items-center space-x-2">
            <Layers size={16} className="text-green-500 drop-shadow-sm" />
            <span className="text-sm font-medium">农村包围城市进度</span>
          </div>
          <span className="text-sm font-mono glass-button px-2.5 py-0.5 rounded-lg">{litCount} / {totalCount}</span>
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          className="bg-zinc-50 dark:bg-black transition-colors"
          colorMode={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        >
          <Background color="#9ca3af" gap={20} size={1} />
          <Controls className="fill-zinc-600 dark:fill-zinc-400" />
        </ReactFlow>

        {/* Add Node Quick Access (Only when empty) */}
      {policies.length > 0 && nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="glass-card p-6 pointer-events-auto text-center max-w-xs transition-colors">
            <Target className="mx-auto mb-3 text-blue-500" size={32} />
            <h3 className="font-medium mb-2">建立你的第一条国策</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">从你的国策库中选择一条作为体系的基石。</p>
            <div className="space-y-2">
              {policies.slice(0, 3).map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleAddPolicyToTree(p.id, p.title)}
                  className="w-full text-left px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  + {p.title}
                </button>
              ))}
            </div>
            {policies.length > 3 && (
              <button 
                onClick={() => setIsAddNodeDrawerOpen(true)}
                className="w-full mt-2 text-xs text-blue-500 hover:underline py-1"
              >
                查看全部 {policies.length} 条国策...
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      {nodes.length > 0 && (
        <button 
          onClick={() => setIsAddNodeDrawerOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 transition-all z-20"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add Node Drawer */}
      <AnimatePresence>
        {isAddNodeDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddNodeDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 glass-drawer p-6 z-50 max-h-[70vh] flex flex-col transition-colors pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-semibold">添加国策节点</h3>
                <button onClick={() => setIsAddNodeDrawerOpen(false)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-2 flex-1 pb-16">
                {policies.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10">
                    <p>国策库为空</p>
                    <p className="text-xs mt-1">请先到"国策"页面添加或采用模板</p>
                  </div>
                ) : (
                  policies.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => handleAddPolicyToTree(p.id, p.title)}
                      className="w-full text-left px-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors flex items-center justify-between group"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.title}</span>
                      <Plus size={16} className="text-zinc-400 group-hover:text-blue-500" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* Node Action Bottom Sheet */}
      <AnimatePresence>
        {selectedNode && !isCollapseDialogOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-16 left-0 right-0 glass-drawer p-6 z-50 pb-safe transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 font-mono">NODE_ACTION</div>
                  <h3 className="text-xl font-semibold">{selectedNode.data.title as string}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedNode.data.status !== 'LIT' ? (
                  <button 
                    onClick={handleLightNode}
                    disabled={!canLightNode}
                    className="col-span-2 py-4 rounded-xl bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <TrendingUp size={18} />
                    <span>{canLightNode ? '点亮此国策' : '前置条件未满足'}</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => updateNodeStatus(selectedNode.id, 'UNLIT')}
                      className="py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 flex flex-col items-center justify-center space-y-1 transition-colors"
                    >
                      <RotateCcw size={18} />
                      <span className="text-sm">重置为未点亮</span>
                    </button>
                    <button 
                      onClick={handleTriggerCollapse}
                      className="py-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 font-medium hover:bg-red-100 dark:hover:bg-red-900/50 flex flex-col items-center justify-center space-y-1 transition-colors"
                    >
                      <AlertCircle size={18} />
                      <span className="text-sm">宣告崩溃</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Collapse Triage Dialog */}
      <AnimatePresence>
        {isCollapseDialogOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm transition-colors"
          >
            <div className="glass-card p-6 w-full max-w-sm transition-colors">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">发生什么了？</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                宣告崩溃后，该节点及其所有子节点都将退回休眠状态。系统崩溃是迭代的必经之路，别气馁。
              </p>
              
              <div className="space-y-3 mb-4">
                {[
                  { text: '触发器忘了', desc: '需要重新设计提醒或关联动作', action: '修改国策' },
                  { text: '动作成本太高', desc: '需要进行降维打击，拆分国策', action: '拆分国策' },
                  { text: '外界不可抗力', desc: '系统遭遇黑天鹅，接受现实', action: '确认崩溃' },
                  { text: '情绪低落', desc: '休息一下，从简单节点重新开始', action: '确认崩溃' }
                ].map(reason => (
                  <button 
                    key={reason.text}
                    onClick={() => confirmCollapse(reason.text)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-zinc-700 dark:text-zinc-300 flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{reason.text}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{reason.desc}</div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs font-medium text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{reason.action}</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-center mt-2">
                <button 
                  onClick={() => setIsCollapseDialogOpen(false)}
                  className="px-6 py-2 rounded-full text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SystemPage = () => {
  return (
    <ReactFlowProvider>
      <SystemPageContent />
    </ReactFlowProvider>
  );
};
