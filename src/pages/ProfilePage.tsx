import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Trash2, Moon, Sun, Monitor, AlertTriangle, Activity, CheckCircle2, PieChart } from 'lucide-react';
import { useSettingsStore, ThemeMode } from '../store/useSettingsStore';
import { useFocusStore } from '../store/useFocusStore';
import { usePolicyStore } from '../store/usePolicyStore';
import { useSystemStore } from '../store/useSystemStore';
import { cn } from '../components/DelayDrawer';
import { formatTime } from '../utils/formatTime';

import { HourlyFocusChart } from '../components/analytics/HourlyFocusChart';
import { UrgeScatterChart } from '../components/analytics/UrgeScatterChart';
import { SystemCorrelationChart } from '../components/analytics/SystemCorrelationChart';

export const ProfilePage = () => {
  const { theme, setTheme } = useSettingsStore();
  const { historySessions, historyUrges, chains } = useFocusStore();
  const { policies } = usePolicyStore();
  const { nodes, edges } = useSystemStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Stats calculation
  const totalFocusTime = historySessions
    .filter(s => s.state === 'finished' && s.actualDuration > 0)
    .reduce((acc, curr) => acc + curr.actualDuration, 0);
  
  const totalSuccessSessions = historySessions.filter(s => s.actualDuration >= s.plannedDuration).length;
  
  const overcomeUrges = historyUrges.filter(u => u.outcome === 'overcome').length;
  const totalUrges = historyUrges.length;
  const urgeWinRate = totalUrges > 0 ? Math.round((overcomeUrges / totalUrges) * 100) : 0;

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
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 pb-24 transition-colors">
      <div className="sticky top-0 z-20 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-6 pt-12 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">我的</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">数据复盘与偏好设置</p>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Weekly Report / Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Activity size={20} className="mr-2 text-blue-500" /> CTDP 核心数据</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm transition-colors">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">总有效专注</div>
              <div className="text-2xl font-medium tabular-nums">{Math.floor(totalFocusTime / 3600)}<span className="text-sm text-zinc-500 font-normal ml-1">小时</span> {Math.floor((totalFocusTime % 3600) / 60)}<span className="text-sm text-zinc-500 font-normal ml-1">分钟</span></div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm transition-colors">
              <div className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">达成目标次数</div>
              <div className="text-2xl font-medium tabular-nums">{totalSuccessSessions} <span className="text-sm text-zinc-500 font-normal">次</span></div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm transition-colors col-span-2 flex justify-between items-center">
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
          
          <HourlyFocusChart />
          <UrgeScatterChart />
          <SystemCorrelationChart />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center"><CheckCircle2 size={20} className="mr-2 text-green-500" /> 外观设置</h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 flex shadow-sm transition-colors">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-medium transition-all",
                  theme === t.id 
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
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
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
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
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:bg-red-50 dark:hover:bg-red-950/20 group transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-colors"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transition-colors"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">确认清除所有数据？</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                这将会删除你的所有专注记录、国策树和偏好设置，且无法恢复。
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleClearAll}
                  className="flex-1 py-3 rounded-xl font-medium bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20 transition-colors"
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
