import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, ChevronRight } from 'lucide-react';
import { useGoalStore, TaskMeta } from '../store/useGoalStore';
import { cn } from './DelayDrawer';

interface GoalPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  value: TaskMeta;
  onChange: (meta: TaskMeta) => void;
}

export const GoalPickerDrawer: React.FC<GoalPickerDrawerProps> = ({ isOpen, onClose, value, onChange }) => {
  const { goals, projects, tasks, createGoal, createProject, createTask } = useGoalStore();
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const selectedGoal = useMemo(() => goals.find(g => g.id === value.goalId) || null, [goals, value.goalId]);
  const selectedProject = useMemo(() => projects.find(p => p.id === value.projectId) || null, [projects, value.projectId]);
  const selectedTask = useMemo(() => tasks.find(t => t.id === value.taskId) || null, [tasks, value.taskId]);

  const filteredProjects = useMemo(() => {
    if (!value.goalId) return [];
    return projects.filter(p => p.goalId === value.goalId);
  }, [projects, value.goalId]);

  const filteredTasks = useMemo(() => {
    if (!value.projectId) return [];
    return tasks.filter(t => t.projectId === value.projectId && !t.archived);
  }, [tasks, value.projectId]);

  const handleCreateGoal = () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    const id = createGoal(title);
    onChange({ goalId: id });
    setNewGoalTitle('');
    setNewProjectTitle('');
    setNewTaskTitle('');
  };

  const handleCreateProject = () => {
    const title = newProjectTitle.trim();
    if (!title || !value.goalId) return;
    const id = createProject(value.goalId, title);
    onChange({ goalId: value.goalId, projectId: id });
    setNewProjectTitle('');
    setNewTaskTitle('');
  };

  const handleCreateTask = () => {
    const title = newTaskTitle.trim();
    if (!title || !value.projectId) return;
    const id = createTask(value.projectId, title);
    onChange({ goalId: value.goalId, projectId: value.projectId, taskId: id });
    setNewTaskTitle('');
  };

  const clear = () => {
    onChange({});
    setNewProjectTitle('');
    setNewTaskTitle('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 glass-drawer p-6 z-50 flex flex-col max-h-[85vh] overflow-y-auto pb-safe"
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />

            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-1">GOAL_LINK</div>
                <h2 className="text-xl font-semibold">关联目标</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">当前选择</div>
                  <button onClick={clear} className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    清空
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">目标</span>
                    <span className="font-medium">{selectedGoal?.title || '未选择'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">项目</span>
                    <span className="font-medium">{selectedProject?.title || '未选择'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">任务</span>
                    <span className="font-medium">{selectedTask?.title || '未选择'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">目标</div>
                {goals.length === 0 ? (
                  <div className="glass-card p-4 text-sm text-zinc-500">还没有目标，先创建一个。</div>
                ) : (
                  <div className="space-y-2">
                    {goals.map(g => (
                      <button
                        key={g.id}
                        onClick={() => onChange({ goalId: g.id })}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between",
                          value.goalId === g.id
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400"
                            : "bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                        )}
                      >
                        <span className="font-medium">{g.title}</span>
                        <ChevronRight size={16} className="opacity-60" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="新目标名称"
                    className="flex-1 bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                  />
                  <button onClick={handleCreateGoal} className="glass-button rounded-xl px-4 py-3">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {value.goalId && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">项目</div>
                  {filteredProjects.length === 0 ? (
                    <div className="glass-card p-4 text-sm text-zinc-500">这个目标下还没有项目。</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProjects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => onChange({ goalId: value.goalId, projectId: p.id })}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between",
                            value.projectId === p.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400"
                              : "bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                          )}
                        >
                          <span className="font-medium">{p.title}</span>
                          <ChevronRight size={16} className="opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="新项目名称"
                      className="flex-1 bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                    />
                    <button onClick={handleCreateProject} className="glass-button rounded-xl px-4 py-3">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {value.projectId && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">任务</div>
                  {filteredTasks.length === 0 ? (
                    <div className="glass-card p-4 text-sm text-zinc-500">这个项目下还没有任务。</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTasks.map(t => (
                        <button
                          key={t.id}
                          onClick={() => onChange({ goalId: value.goalId, projectId: value.projectId, taskId: t.id })}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border transition-colors flex items-center justify-between",
                            value.taskId === t.id
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400"
                              : "bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
                          )}
                        >
                          <span className="font-medium">{t.title}</span>
                          <ChevronRight size={16} className="opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="新任务名称"
                      className="flex-1 bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors backdrop-blur-md"
                    />
                    <button onClick={handleCreateTask} className="glass-button rounded-xl px-4 py-3">
                      <Plus size={18} />
                    </button>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-blue-600/90 text-white font-semibold text-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
                  >
                    完成关联
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

