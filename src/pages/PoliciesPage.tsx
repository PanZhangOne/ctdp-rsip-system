import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, MapPin, Activity, Trash2, CheckCircle2, History } from 'lucide-react';
import { usePolicyStore, TEMPLATE_POLICIES, Policy } from '../store/usePolicyStore';
import { useSystemStore, CollapseLog } from '../store/useSystemStore';
import { useGoalStore } from '../store/useGoalStore';
import { cn } from '../components/DelayDrawer';

const PolicyCard = ({ policy, onEdit, onDelete, onToggle, logs = [] }: { 
  key?: React.Key,
  policy: Policy, 
  onEdit?: (p: Policy) => void,
  onDelete?: (id: string) => void,
  onToggle?: (id: string) => void,
  logs?: CollapseLog[]
}) => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className={cn(
      "glass-card p-5 transition-all duration-300 group",
      policy.isActive 
        ? "border-blue-400/30 dark:border-blue-500/30 shadow-[0_8px_24px_-6px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_24px_-6px_rgba(59,130,246,0.2)]" 
        : "opacity-70 hover:opacity-100"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">{policy.title}</h3>
        <div className="flex items-center space-x-2">
          {onToggle && (
            <button 
              onClick={() => onToggle(policy.id)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative shadow-inner",
                policy.isActive ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <motion.div 
                layout
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                initial={false}
                animate={{ left: policy.isActive ? "calc(100% - 22px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-2 py-1 rounded-lg text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 shadow-sm">IF</div>
          <div className="text-zinc-700 dark:text-zinc-300 flex-1 leading-relaxed">{policy.conditionIf}</div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-mono mt-0.5 shadow-sm">THEN</div>
          <div className="text-zinc-900 dark:text-zinc-100 font-medium flex-1 leading-relaxed">{policy.actionThen}</div>
        </div>
      </div>

      {policy.reminderTime && (
        <div className="mt-5 flex items-center text-xs text-blue-500/80 dark:text-blue-400/80 space-x-1.5 bg-blue-50/50 dark:bg-blue-900/10 w-fit px-3 py-1.5 rounded-full">
          <Clock size={14} />
          <span className="font-medium">每日 {policy.reminderTime} 提醒</span>
        </div>
      )}

      {(onEdit || onDelete || logs.length > 0) && (
        <div className="mt-5 pt-4 border-t border-zinc-200/50 dark:border-zinc-700/50 flex justify-between items-center space-x-4">
          <div className="flex-1">
            {logs.length > 0 && (
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center space-x-1.5 text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
              >
                <History size={14} />
                <span>{logs.length} 次崩溃记录</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {onDelete && (
              <button onClick={() => onDelete(policy.id)} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-all">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse Logs Dropdown */}
      <AnimatePresence>
        {showLogs && logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 pt-2">
              {logs.map((log, idx) => (
                <div key={log.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-700/50 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">#{logs.length - idx} 崩溃复盘</span>
                    <span className="text-xs text-zinc-400 font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start">
                      <span className="text-zinc-400 w-12 shrink-0">原因：</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{log.reason}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-zinc-400 w-12 shrink-0">迭代：</span>
                      <span className="text-orange-600 dark:text-orange-400 font-medium">{log.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TemplateCard = ({ template, onAdopt }: { 
  key?: React.Key,
  template: Policy, 
  onAdopt: (id: string) => void 
}) => {
  const store = usePolicyStore();
  const isAdopted = store.policies.some(p => p.title === template.title);

  return (
    <div className="glass-card p-5 group">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{template.title}</h3>
        {isAdopted ? (
          <span className="flex items-center text-xs text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full border border-green-200/50 dark:border-green-900/50">
            <CheckCircle2 size={12} className="mr-1" /> 已采用
          </span>
        ) : (
          <button 
            onClick={() => onAdopt(template.id)}
            className="text-xs bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all border border-zinc-200/50 dark:border-zinc-600 hover:-translate-y-0.5"
          >
            采用模板
          </button>
        )}
      </div>
      <div className="text-sm space-y-1.5">
        <p className="text-zinc-500 dark:text-zinc-400"><span className="font-mono text-[10px] bg-zinc-200/50 dark:bg-zinc-700/50 px-1.5 py-0.5 rounded mr-1.5">IF</span>{template.conditionIf}</p>
        <p className="text-zinc-700 dark:text-zinc-300"><span className="font-mono text-[10px] bg-blue-100/50 dark:bg-blue-900/30 text-blue-500 px-1.5 py-0.5 rounded mr-1.5">THEN</span>{template.actionThen}</p>
      </div>
    </div>
  );
};

export const PoliciesPage = () => {
  const store = usePolicyStore();
  const systemStore = useSystemStore();
  const goalStore = useGoalStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy>>({ isActive: true });
  const [activeTab, setActiveTab] = useState<'my' | 'templates'>('my');

  const handleSave = () => {
    if (!editingPolicy.title || !editingPolicy.conditionIf || !editingPolicy.actionThen) return;
    
    store.addPolicy({
      title: editingPolicy.title,
      conditionIf: editingPolicy.conditionIf,
      actionThen: editingPolicy.actionThen,
      reminderTime: editingPolicy.reminderTime,
      isActive: editingPolicy.isActive ?? true,
      goalId: editingPolicy.goalId,
      projectId: editingPolicy.projectId,
    });
    
    setIsEditorOpen(false);
    setEditingPolicy({ isActive: true });
  };

  return (
    <div className="min-h-[100dvh] text-zinc-900 dark:text-zinc-100 pb-24 transition-colors relative">
      {/* Background Ambience / Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-black dark:to-black -z-10 transition-colors pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-20 glass-panel border-x-0 border-t-0 px-6 pt-14 pb-2 shadow-sm rounded-b-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">国策库</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">定义你的 IF-THEN 行为底线</p>
        
        {/* Tabs */}
        <div className="flex space-x-6 mt-6">
          <button 
            onClick={() => setActiveTab('my')}
            className={cn(
              "pb-3 text-sm font-medium transition-all relative",
              activeTab === 'my' 
                ? "text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            我的国策 ({store.policies.length})
            {activeTab === 'my' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "pb-3 text-sm font-medium transition-all relative",
              activeTab === 'templates' 
                ? "text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            经典模板
            {activeTab === 'templates' && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'my' ? (
            <motion.div 
              key="my"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {store.policies.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
                  <p>还没有制定任何国策</p>
                  <button 
                    onClick={() => setActiveTab('templates')}
                    className="text-blue-500 mt-2 hover:underline"
                  >
                    从模板挑选一个开始
                  </button>
                </div>
              ) : (
                store.policies.map(policy => (
                  <PolicyCard 
                    key={policy.id} 
                    policy={policy} 
                    onDelete={store.deletePolicy}
                    onToggle={store.togglePolicyActive}
                    logs={systemStore.collapseLogs?.filter(log => log.policyId === policy.id) || []}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="templates"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {TEMPLATE_POLICIES.map(tpl => (
                <TemplateCard 
                  key={tpl.id} 
                  template={tpl} 
                  onAdopt={store.adoptTemplate} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button 
        onClick={() => setIsEditorOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center hover:bg-blue-500 transition-colors z-20"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Sheet Editor */}
      <AnimatePresence>
        {isEditorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 glass-drawer p-6 z-50 flex flex-col max-h-[85vh] overflow-y-auto pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">制定新国策</h2>
                <button onClick={() => setIsEditorOpen(false)} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">国策名称</label>
                  <input 
                    type="text" 
                    placeholder="例如：夜幕降临"
                    value={editingPolicy.title || ''}
                    onChange={e => setEditingPolicy(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                  />
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">IF</span>
                      <label className="text-sm font-medium">触发器 (条件)</label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="如果发生了什么..."
                      value={editingPolicy.conditionIf || ''}
                      onChange={e => setEditingPolicy(p => ({ ...p, conditionIf: e.target.value }))}
                      className="w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setEditingPolicy(p => ({...p, conditionIf: '晚上 22:00'}))} className="flex items-center text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300"><Clock size={12} className="mr-1"/>时间</button>
                      <button onClick={() => setEditingPolicy(p => ({...p, conditionIf: '走到沙发前'}))} className="flex items-center text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300"><MapPin size={12} className="mr-1"/>地点</button>
                      <button onClick={() => setEditingPolicy(p => ({...p, conditionIf: '洗完澡后'}))} className="flex items-center text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300"><Activity size={12} className="mr-1"/>动作</button>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-xs font-mono font-bold text-blue-700 dark:text-blue-400">THEN</span>
                      <label className="text-sm font-medium">具体动作 (结果)</label>
                    </div>
                    <textarea 
                      rows={3}
                      placeholder="我就去执行..."
                      value={editingPolicy.actionThen || ''}
                      onChange={e => setEditingPolicy(p => ({ ...p, actionThen: e.target.value }))}
                      className="w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">提醒时间 (可选)</label>
                  <input 
                    type="time" 
                    value={editingPolicy.reminderTime || ''}
                    onChange={e => setEditingPolicy(p => ({ ...p, reminderTime: e.target.value }))}
                    className="w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors color-scheme-light dark:color-scheme-dark backdrop-blur-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">关联目标 (可选)</label>
                  <div className="glass-card p-3 space-y-3">
                    <select
                      value={editingPolicy.goalId || ''}
                      onChange={(e) => {
                        const goalId = e.target.value || undefined;
                        setEditingPolicy(p => ({ ...p, goalId, projectId: undefined }));
                      }}
                      className="w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                    >
                      <option value="">不关联</option>
                      {goalStore.goals.map(g => (
                        <option key={g.id} value={g.id}>{g.title}</option>
                      ))}
                    </select>

                    <select
                      value={editingPolicy.projectId || ''}
                      disabled={!editingPolicy.goalId}
                      onChange={(e) => {
                        const projectId = e.target.value || undefined;
                        setEditingPolicy(p => ({ ...p, projectId }));
                      }}
                      className={cn(
                        "w-full bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md",
                        !editingPolicy.goalId && "opacity-50"
                      )}
                    >
                      <option value="">不关联项目</option>
                      {goalStore.projects.filter(p => p.goalId === editingPolicy.goalId).map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleSave}
                  disabled={!editingPolicy.title || !editingPolicy.conditionIf || !editingPolicy.actionThen}
                  className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
                >
                  保存国策
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
