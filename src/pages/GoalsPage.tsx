import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ArrowLeft, Plus, Activity, CheckCircle2, Flame, Trash2 } from 'lucide-react';
import { useGoalStore } from '../store/useGoalStore';
import { cn } from '../components/DelayDrawer';
import { formatTime } from '../utils/formatTime';

interface GoalSummary {
  goal: { id: string; title: string };
  focusSeconds: number;
  focusSessions: number;
  collapseCount: number;
  litCount: number;
  recentLitCount: number;
}

interface GoalsPageProps {
  onClose: () => void;
  goalSummaries: GoalSummary[];
}

export const GoalsPage: React.FC<GoalsPageProps> = ({ onClose, goalSummaries }) => {
  const { goals, projects, tasks, createGoal, createProject, createTask, deleteGoal, deleteProject, deleteTask } = useGoalStore();
  
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const handleCreateGoal = () => {
    if (newGoalTitle.trim()) {
      createGoal(newGoalTitle.trim());
      setNewGoalTitle('');
    }
  };

  const handleCreateProject = (goalId: string) => {
    if (newProjectTitle.trim()) {
      createProject(goalId, newProjectTitle.trim());
      setNewProjectTitle('');
    }
  };

  const handleCreateTask = (projectId: string) => {
    if (newTaskTitle.trim()) {
      createTask(projectId, newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#f4f4f5] dark:bg-black overflow-y-auto"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-black dark:to-black -z-10 pointer-events-none" />

      <div className="sticky top-0 z-20 glass-panel border-x-0 border-t-0 px-4 pt-12 pb-4 flex items-center space-x-3">
        <button onClick={onClose} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">目标体系管理</h1>
      </div>

      <div className="p-6 pb-safe max-w-lg mx-auto space-y-8">
        
        {/* Create New Goal */}
        <section className="glass-card p-5">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">创建新目标 (Goal)</h3>
          <div className="flex items-center space-x-2">
            <input
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="例如：成为高级前端工程师"
              className="flex-1 bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button onClick={handleCreateGoal} disabled={!newGoalTitle.trim()} className="glass-button rounded-xl px-4 py-3 disabled:opacity-50">
              <Plus size={18} />
            </button>
          </div>
        </section>

        {/* Goals List & Review */}
        <section className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">暂无目标，请先创建一个</div>
          ) : (
            goals.map(goal => {
              const summary = goalSummaries.find(s => s.goal.id === goal.id);
              const goalProjects = projects.filter(p => p.goalId === goal.id);
              const isExpanded = expandedGoalId === goal.id;

              return (
                <div key={goal.id} className="glass-card p-5 transition-all">
                  <div 
                    className="flex items-start justify-between cursor-pointer group"
                    onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                  >
                    <div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-1">GOAL</div>
                      <div className="text-lg font-semibold group-hover:text-blue-500 transition-colors">{goal.title}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {summary && (
                        <div className="text-right">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">总专注</div>
                          <div className="text-lg font-medium tabular-nums">{formatTime(summary.focusSeconds)}</div>
                        </div>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                        className="text-zinc-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {summary && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <Activity size={14} />
                          <span>专注次数</span>
                        </div>
                        <div className="text-xl font-medium tabular-nums">{summary.focusSessions}</div>
                      </div>
                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3 relative overflow-hidden">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span>累计点亮</span>
                        </div>
                        <div className="text-xl font-medium tabular-nums">{summary.litCount}</div>
                        {summary.recentLitCount > 0 && (
                          <div className="absolute right-2 bottom-2 text-[10px] font-medium text-green-600 bg-green-100/80 px-1.5 py-0.5 rounded-md">
                            近7天 +{summary.recentLitCount}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <Flame size={14} className={summary.collapseCount > 0 ? "text-orange-500" : "text-zinc-400"} />
                          <span>崩溃次数</span>
                        </div>
                        <div className={cn("text-xl font-medium tabular-nums", summary.collapseCount > 0 ? "text-orange-500" : "")}>{summary.collapseCount}</div>
                      </div>
                    </div>
                  )}

                  {/* Projects List (Expandable) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-4">
                          <h4 className="text-sm font-medium text-zinc-500 flex items-center justify-between">
                            <span>所属项目 (Projects)</span>
                          </h4>
                          
                          <div className="space-y-3 pl-2 border-l-2 border-zinc-200 dark:border-zinc-800">
                            {goalProjects.map(project => {
                              const projectTasks = tasks.filter(t => t.projectId === project.id);
                              const isProjExpanded = expandedProjectId === project.id;
                              
                              return (
                                <div key={project.id} className="bg-white/30 dark:bg-black/20 rounded-xl p-3 border border-white/40 dark:border-white/10">
                                  <div 
                                    className="flex justify-between items-center cursor-pointer group/proj"
                                    onClick={() => setExpandedProjectId(isProjExpanded ? null : project.id)}
                                  >
                                    <div className="font-medium text-zinc-800 dark:text-zinc-200 group-hover/proj:text-blue-500 transition-colors">{project.title}</div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                      className="text-zinc-400 hover:text-red-500 p-1 opacity-0 group-hover/proj:opacity-100 transition-opacity"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>

                                  <AnimatePresence>
                                    {isProjExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-2">
                                          {projectTasks.map(task => (
                                            <div key={task.id} className="flex justify-between items-center text-sm pl-2">
                                              <span className="text-zinc-600 dark:text-zinc-400 before:content-['•'] before:mr-2 before:text-zinc-300">{task.title}</span>
                                              <button 
                                                onClick={() => deleteTask(task.id)}
                                                className="text-zinc-400 hover:text-red-500 transition-colors"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          ))}
                                          
                                          <div className="flex items-center space-x-2 pt-2 mt-2">
                                            <input
                                              value={newTaskTitle}
                                              onChange={(e) => setNewTaskTitle(e.target.value)}
                                              placeholder="添加新任务..."
                                              className="flex-1 bg-transparent border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <button onClick={() => handleCreateTask(project.id)} disabled={!newTaskTitle.trim()} className="text-blue-500 disabled:opacity-50">
                                              <Plus size={18} />
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <input
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                placeholder="添加新项目..."
                                className="flex-1 bg-white/50 dark:bg-black/30 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                              />
                              <button onClick={() => handleCreateProject(goal.id)} disabled={!newProjectTitle.trim()} className="glass-button rounded-xl px-3 py-2.5 disabled:opacity-50">
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </section>
      </div>
    </motion.div>
  );
};
