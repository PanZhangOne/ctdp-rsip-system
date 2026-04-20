import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, MapPin, Activity, Trash2, CheckCircle2 } from 'lucide-react';
import { usePolicyStore, TEMPLATE_POLICIES, Policy } from '../store/usePolicyStore';
import { cn } from '../components/DelayDrawer';

const PolicyCard = ({ policy, onEdit, onDelete, onToggle }: { 
  policy: Policy, 
  onEdit?: (p: Policy) => void,
  onDelete?: (id: string) => void,
  onToggle?: (id: string) => void 
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm transition-all duration-300",
      policy.isActive 
        ? "border-blue-200 dark:border-blue-900/30 shadow-blue-500/5 dark:shadow-blue-900/10" 
        : "border-zinc-200 dark:border-zinc-800 opacity-60"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{policy.title}</h3>
        <div className="flex items-center space-x-2">
          {onToggle && (
            <button 
              onClick={() => onToggle(policy.id)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                policy.isActive ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
              )}
            >
              <motion.div 
                layout
                className="w-4 h-4 bg-white rounded-full absolute top-1"
                initial={false}
                animate={{ left: policy.isActive ? "calc(100% - 20px)" : "4px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">IF</div>
          <div className="text-zinc-700 dark:text-zinc-300 flex-1">{policy.conditionIf}</div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-mono mt-0.5">THEN</div>
          <div className="text-zinc-900 dark:text-zinc-100 font-medium flex-1">{policy.actionThen}</div>
        </div>
      </div>

      {policy.reminderTime && (
        <div className="mt-4 flex items-center text-xs text-zinc-500 dark:text-zinc-400 space-x-1">
          <Clock size={14} />
          <span>提醒: {policy.reminderTime}</span>
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end space-x-4">
          {onDelete && (
            <button onClick={() => onDelete(policy.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ template, onAdopt }: { template: Policy, onAdopt: (id: string) => void }) => {
  const store = usePolicyStore();
  const isAdopted = store.policies.some(p => p.title === template.title);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{template.title}</h3>
        {isAdopted ? (
          <span className="flex items-center text-xs text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-full">
            <CheckCircle2 size={12} className="mr-1" /> 已采用
          </span>
        ) : (
          <button 
            onClick={() => onAdopt(template.id)}
            className="text-xs bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full shadow-sm hover:shadow transition-shadow"
          >
            采用模板
          </button>
        )}
      </div>
      <div className="text-sm space-y-1">
        <p className="text-zinc-500 dark:text-zinc-400"><span className="font-mono text-xs mr-1">IF</span>{template.conditionIf}</p>
        <p className="text-zinc-700 dark:text-zinc-300"><span className="font-mono text-xs mr-1 text-blue-500">THEN</span>{template.actionThen}</p>
      </div>
    </div>
  );
};

export const PoliciesPage = () => {
  const store = usePolicyStore();
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
    });
    
    setIsEditorOpen(false);
    setEditingPolicy({ isActive: true });
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-24 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 pt-12 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">国策库</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">定义你的 IF-THEN 行为底线</p>
        
        {/* Tabs */}
        <div className="flex space-x-6 mt-6">
          <button 
            onClick={() => setActiveTab('my')}
            className={cn(
              "pb-2 text-sm font-medium transition-colors border-b-2",
              activeTab === 'my' 
                ? "border-blue-500 text-zinc-900 dark:text-zinc-100" 
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            我的国策 ({store.policies.length})
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={cn(
              "pb-2 text-sm font-medium transition-colors border-b-2",
              activeTab === 'templates' 
                ? "border-blue-500 text-zinc-900 dark:text-zinc-100" 
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            经典模板
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-6 z-50 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto"
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
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
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
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
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
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">提醒时间 (可选)</label>
                  <input 
                    type="time" 
                    value={editingPolicy.reminderTime || ''}
                    onChange={e => setEditingPolicy(p => ({ ...p, reminderTime: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors color-scheme-light dark:color-scheme-dark"
                  />
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
