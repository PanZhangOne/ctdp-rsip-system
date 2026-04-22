import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Moon, Sun, Monitor, AlertTriangle, Activity, CheckCircle2, PieChart, Target, Flame } from 'lucide-react';
import { useSettingsStore, ThemeMode } from '../store/useSettingsStore';
import { useFocusStore } from '../store/useFocusStore';
import { usePolicyStore } from '../store/usePolicyStore';
import { useSystemStore } from '../store/useSystemStore';
import { useGoalStore } from '../store/useGoalStore';
import { cn } from '../components/DelayDrawer';
import { formatTime } from '../utils/formatTime';

import { HourlyFocusChart } from '../components/analytics/HourlyFocusChart';
import { UrgeScatterChart } from '../components/analytics/UrgeScatterChart';
import { SystemCorrelationChart } from '../components/analytics/SystemCorrelationChart';

export const ProfilePage = () => {
  const { theme, setTheme } = useSettingsStore();
  const { historySessions, historyUrges, chains } = useFocusStore();
  const { policies } = usePolicyStore();
  const { nodes, collapseLogs } = useSystemStore();
  const { goals, projects, tasks } = useGoalStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Stats calculation
  const totalFocusTime = historySessions
    .filter(s => s.state === 'finished' && s.actualDuration > 0)
    .reduce((acc, curr) => acc + curr.actualDuration, 0);
  
  const totalSuccessSessions = historySessions.filter(s => s.actualDuration >= s.plannedDuration).length;
  
  const overcomeUrges = historyUrges.filter(u => u.outcome === 'overcome').length;
  const totalUrges = historyUrges.length;
  const urgeWinRate = totalUrges > 0 ? Math.round((overcomeUrges / totalUrges) * 100) : 0;

  const projectById = new Map(projects.map(p => [p.id, p]));
  const taskById = new Map(tasks.map(t => [t.id, t]));
  const policyById = new Map(policies.map(p => [p.id, p]));

  const resolveGoalIdFromMeta = (meta?: { goalId?: string; projectId?: string; taskId?: string }) => {
    if (!meta) return undefined;
    if (meta.goalId) return meta.goalId;
    if (meta.projectId) return projectById.get(meta.projectId)?.goalId;
    if (meta.taskId) {
      const task = taskById.get(meta.taskId);
      if (!task) return undefined;
      return projectById.get(task.projectId)?.goalId;
    }
    return undefined;
  };

  const goalSummaries = goals.map(g => {
    const focusSessions = historySessions.filter(s => resolveGoalIdFromMeta(s.taskMeta) === g.id);
    const focusSeconds = focusSessions.reduce((acc, s) => acc + (s.actualDuration || 0), 0);

    const goalPolicyIds = policies
      .filter(p => {
        if (p.goalId) return p.goalId === g.id;
        if (p.projectId) return projectById.get(p.projectId)?.goalId === g.id;
        return false;
      })
      .map(p => p.id);

    const collapseCount = collapseLogs.filter(l => goalPolicyIds.includes(l.policyId)).length;

    const litCount = nodes.filter(n => {
      if (n.data.status !== 'LIT') return false;
      const policy = policyById.get(n.data.policyId);
      if (!policy) return false;
      const goalId = policy.goalId || (policy.projectId ? projectById.get(policy.projectId)?.goalId : undefined);
      return goalId === g.id;
    }).length;

    return {
      goal: g,
      focusSeconds,
      focusSessions: focusSessions.length,
      collapseCount,
      litCount
    };
  });

  const handleExport = () => {
    const data = {
      focusStore: localStorage.getItem('focus-storage'),
      policyStore: localStorage.getItem('policy-storage'),
      systemStore: localStorage.getItem('system-tree-storage'),
      settingsStore: localStorage.getItem('settings-storage'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ctdp-rsip-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    localStorage.removeItem('focus-storage');
    localStorage.removeItem('policy-storage');
    localStorage.removeItem('system-tree-storage');
    window.location.reload();
  };

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: '浅色', icon: <Sun size={16} /> },
    { id: 'dark', label: '深色', icon: <Moon size={16} /> },
    { id: 'system', label: '跟随系统', icon: <Monitor size={16} /> }
  ];

  return (
    <div className="min-h-[100dvh] text-zinc-900 dark:text-zinc-100 pb-24 transition-colors relative">
      {/* Background Ambience / Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-zinc-50 to-zinc-50 dark:from-blue-900/20 dark:via-black dark:to-black -z-10 transition-colors pointer-events-none" />

      <div className="sticky top-0 z-20 glass-panel border-x-0 border-t-0 px-6 pt-14 pb-4 rounded-b-[2.5rem]">
        <h1 className="text-3xl font-semibold tracking-tight">我的</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">数据复盘与偏好设置</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Weekly Report / Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Activity size={20} className="mr-2 text-blue-500" /> CTDP 核心数据</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 transition-colors">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">总有效专注</div>
              <div className="text-2xl font-medium tabular-nums">{Math.floor(totalFocusTime / 3600)}<span className="text-sm text-zinc-500 font-normal ml-1">小时</span> {Math.floor((totalFocusTime % 3600) / 60)}<span className="text-sm text-zinc-500 font-normal ml-1">分钟</span></div>
            </div>
            
            <div className="glass-card p-4 transition-colors">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">达成目标次数</div>
              <div className="text-2xl font-medium tabular-nums">{totalSuccessSessions} <span className="text-sm text-zinc-500 font-normal">次</span></div>
            </div>
            
            <div className="glass-card p-4 transition-colors col-span-2 flex justify-between items-center">
              <div>
                <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">时延对抗胜率</div>
                <div className="text-sm text-zinc-500">遇到 {totalUrges} 次冲动，扛过 {overcomeUrges} 次</div>
              </div>
              <div className="text-3xl font-light text-orange-500 tabular-nums">
                {urgeWinRate}%
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Charts */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><PieChart size={20} className="mr-2 text-purple-500" /> 数据交叉分析</h2>
          
          <div className="space-y-6">
            <div className="glass-card overflow-hidden">
              <HourlyFocusChart />
            </div>
            <div className="glass-card overflow-hidden">
              <UrgeScatterChart />
            </div>
            <div className="glass-card overflow-hidden">
              <SystemCorrelationChart />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Target size={20} className="mr-2 text-blue-500" /> 目标复盘</h2>
          {goalSummaries.length === 0 ? (
            <div className="glass-card p-6 text-zinc-500 dark:text-zinc-400">
              <div className="font-medium text-zinc-700 dark:text-zinc-200 mb-1">还没有目标体系</div>
              <div className="text-sm">去专注页点击“关联目标”，创建 Goal / Project / Task，并把专注与国策绑定到同一个目标上。</div>
            </div>
          ) : (
            <div className="space-y-4">
              {goalSummaries
                .sort((a, b) => (b.focusSeconds + b.litCount * 60) - (a.focusSeconds + a.litCount * 60))
                .map(({ goal, focusSeconds, focusSessions, collapseCount, litCount }) => (
                  <div key={goal.id} className="glass-card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-1">GOAL</div>
                        <div className="text-lg font-semibold">{goal.title}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">总专注</div>
                        <div className="text-lg font-medium tabular-nums">{formatTime(focusSeconds)}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <Activity size={14} />
                          <span>专注次数</span>
                        </div>
                        <div className="text-xl font-medium tabular-nums">{focusSessions}</div>
                      </div>

                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span>点亮节点</span>
                        </div>
                        <div className="text-xl font-medium tabular-nums">{litCount}</div>
                      </div>

                      <div className="bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl p-3">
                        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                          <Flame size={14} className={collapseCount > 0 ? "text-orange-500" : "text-zinc-400"} />
                          <span>崩溃次数</span>
                        </div>
                        <div className={cn("text-xl font-medium tabular-nums", collapseCount > 0 ? "text-orange-500" : "")}>{collapseCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><CheckCircle2 size={20} className="mr-2 text-green-500" /> 外观设置</h2>
          <div className="glass-card p-1.5 flex transition-colors">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-3 rounded-[1.75rem] text-sm font-medium transition-all duration-300",
                  theme === t.id 
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-md" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-white/30 dark:hover:bg-white/5"
                )}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">数据管理</h2>
          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full glass-button rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm transition-colors">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">导出数据备份</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">将所有本地数据保存为 JSON</div>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="w-full glass-button rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-50/80 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 shadow-sm transition-colors">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-red-600 dark:text-red-500">清除所有数据</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">危险操作：此操作不可逆</div>
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Clear Confirmation Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md transition-colors"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card bg-white/90 dark:bg-zinc-900/90 p-8 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              <div className="w-14 h-14 bg-red-100/80 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner mx-auto">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100 text-center">确认清除所有数据？</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 text-center leading-relaxed">
                这将会删除你的所有专注记录、国策树和偏好设置，且无法恢复。
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleClearAll}
                  className="flex-1 py-3.5 rounded-2xl font-medium bg-red-600 text-white hover:bg-red-500 shadow-[0_8px_20px_rgba(220,38,38,0.25)] transition-all active:scale-95"
                >
                  确认清除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
