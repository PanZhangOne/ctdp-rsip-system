import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Pause, AlertTriangle, Link2, Settings, Star, CheckCircle, Plus, Trash2, X } from 'lucide-react';
import { useFocusStore } from '../store/useFocusStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { DelayDrawer, cn } from '../components/DelayDrawer';
import { formatTime } from '../utils/formatTime';

export const FocusPage: React.FC = () => {
  const store = useFocusStore();
  const settings = useSettingsStore();
  const [taskName, setTaskName] = useState('');
  const [selectedTime, setSelectedTime] = useState(settings.defaultFocusDuration);
  const [selectedChain, setSelectedChain] = useState(store.chains[0]?.id || 'default');
  const [isDelayOpen, setIsDelayOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Ritual and Post-Rating State
  const [showRitual, setShowRitual] = useState(false);
  const [ritualChecks, setRitualChecks] = useState([false, false, false]);
  
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [pendingStopData, setPendingStopData] = useState<{type: 'success' | 'degrade' | 'fail', elapsed: number} | null>(null);

  // Chains and Settings Drawers State
  const [showChainsDrawer, setShowChainsDrawer] = useState(false);
  const [newChainName, setNewChainName] = useState('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const session = store.currentSession;
  const isRunning = session?.state === 'running';
  const isPaused = session?.state === 'paused';
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (session) {
      setElapsed(session.actualDuration);
      if (isRunning) {
        timerRef.current = window.setInterval(() => {
          setElapsed(prev => {
            const next = prev + 1;
            // Update actual duration implicitly for now, we'll sync it fully on pause/finish
            return next;
          });
        }, 1000);
      }
    } else {
      setElapsed(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, isRunning]);

  const handleStart = () => {
    if (!taskName.trim()) return;
    setShowRitual(true);
  };

  const confirmRitualAndStart = () => {
    setShowRitual(false);
    store.startSession(taskName, selectedTime, selectedChain);
    setRitualChecks([false, false, false]);
  };

  const handleStop = (type: 'success' | 'degrade' | 'fail') => {
    // Save current elapsed to state for rating step
    setPendingStopData({ type, elapsed });
    setShowRating(true);
  };

  const confirmRatingAndStop = () => {
    if (pendingStopData) {
      store.finishSession(pendingStopData.elapsed, pendingStopData.type, rating);
    }
    setShowRating(false);
    setRating(0);
    setPendingStopData(null);
    setElapsed(0);
  };

  const activeChain = store.chains.find(c => c.id === (session?.chainId || selectedChain));

  const handleCreateChain = () => {
    if (newChainName.trim()) {
      store.createChain(newChainName.trim());
      setNewChainName('');
    }
  };

  const handleUpdateSettings = (duration: number) => {
    settings.setDefaultFocusDuration(duration);
    setSelectedTime(duration);
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col pt-12 pb-24 px-6 overflow-hidden relative transition-colors">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200 via-zinc-50 to-zinc-50 dark:from-zinc-900 dark:via-black dark:to-black -z-10 transition-colors" />

      {/* Header / Chain Status */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-12 z-10"
      >
        <button 
          onClick={() => !session && setShowChainsDrawer(true)}
          className={cn(
            "flex items-center space-x-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors",
            !session && "hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
          )}
        >
          <Link2 size={16} className={activeChain?.currentLength ? 'text-green-500' : 'text-zinc-400 dark:text-zinc-500'} />
          <span className="text-sm font-medium">{activeChain?.name || '选择专注链'}</span>
          <span className="bg-zinc-100 dark:bg-zinc-800 text-xs px-2 py-0.5 rounded-md tabular-nums font-mono transition-colors">
            {activeChain?.currentLength || 0} 连
          </span>
        </button>
        <button 
          onClick={() => !session && setShowSettingsDrawer(true)}
          disabled={!!session}
          className={cn(
            "p-2 text-zinc-500 dark:text-zinc-400 transition-colors",
            !session ? "hover:text-zinc-900 dark:hover:text-white" : "opacity-50"
          )}
        >
          <Settings size={20} />
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {!session ? (
          /* Start State */
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10"
          >
            <div className="space-y-8">
              <div>
                <input
                  type="text"
                  placeholder="今天要专注什么？"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full bg-transparent text-3xl font-light placeholder-zinc-400 dark:placeholder-zinc-700 border-b border-zinc-200 dark:border-zinc-800 pb-4 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[25, 45, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedTime(m * 60)}
                    className={cn(
                      "py-4 rounded-2xl border text-lg transition-all duration-300",
                      selectedTime === m * 60 
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black border-transparent shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {m}m
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleStart}
                disabled={!taskName.trim()}
                className="w-full mt-12 py-5 rounded-[2rem] bg-blue-600 text-white font-medium text-xl shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <Play fill="currentColor" size={24} />
                <span>开始专注</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Active State */
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-between items-center w-full z-10"
          >
            <div className="text-center mt-8">
              <h2 className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">{session.taskId}</h2>
              <div className="text-8xl font-extralight tracking-tighter tabular-nums mb-4">
                {formatTime(session.plannedDuration - elapsed > 0 ? session.plannedDuration - elapsed : 0)}
              </div>
              <div className="flex items-center justify-center space-x-2 text-zinc-500 text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>专注中</span>
              </div>
            </div>

            {/* Circular Progress Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-[0.5px] border-zinc-300 dark:border-zinc-800 rounded-full opacity-40 dark:opacity-20 pointer-events-none transition-colors" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-[0.5px] border-zinc-200 dark:border-zinc-800/50 rounded-full opacity-40 dark:opacity-10 pointer-events-none transition-colors" />

            <div className="w-full max-w-sm space-y-6">
              <button
                onClick={() => setIsDelayOpen(true)}
                className="w-full py-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-orange-200 dark:border-orange-900/30 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors flex justify-center items-center space-x-2 backdrop-blur-md"
              >
                <AlertTriangle size={18} />
                <span>我想分心了</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                {isRunning ? (
                  <button
                    onClick={store.pauseSession}
                    className="py-5 rounded-[2rem] bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex justify-center items-center transition-colors"
                  >
                    <Pause size={24} />
                  </button>
                ) : (
                  <button
                    onClick={store.resumeSession}
                    className="py-5 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex justify-center items-center transition-colors"
                  >
                    <Play size={24} />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    const isSuccess = elapsed >= session.plannedDuration;
                    const isDegrade = elapsed >= session.plannedDuration * 0.5; // 50% for degrade
                    handleStop(isSuccess ? 'success' : isDegrade ? 'degrade' : 'fail');
                  }}
                  className={cn(
                    "py-5 rounded-[2rem] flex justify-center items-center transition-all",
                    elapsed >= session.plannedDuration 
                      ? "bg-green-600 text-white shadow-lg shadow-green-900/20" 
                      : "bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/50"
                  )}
                >
                  <Square size={24} className={elapsed >= session.plannedDuration ? "fill-current" : ""} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DelayDrawer 
        isOpen={isDelayOpen} 
        onClose={() => setIsDelayOpen(false)} 
      />

      {/* Ritual Drawer */}
      <AnimatePresence>
        {showRitual && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRitual(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-6 z-50 shadow-2xl flex flex-col transition-colors pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />
              
              <h3 className="text-xl font-semibold mb-2">神圣座位协议</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">进入专注前，请确认你已完成以下前置动作：</p>

              <div className="space-y-3 mb-8">
                {[
                  "清理桌面无关物品，只留当前任务",
                  "手机静音或开启勿扰模式，放在看不见的地方",
                  "深呼吸三次，清空工作记忆"
                ].map((text, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      const newChecks = [...ritualChecks];
                      newChecks[idx] = !newChecks[idx];
                      setRitualChecks(newChecks);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-4 rounded-xl border flex items-center space-x-3 transition-colors",
                      ritualChecks[idx] 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400" 
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                    )}
                  >
                    <CheckCircle size={20} className={ritualChecks[idx] ? "text-blue-500" : "text-zinc-300 dark:text-zinc-600"} />
                    <span className="text-sm font-medium">{text}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={confirmRitualAndStart}
                disabled={!ritualChecks.every(Boolean)}
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-medium text-lg hover:bg-blue-500 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 transition-colors"
              >
                {ritualChecks.every(Boolean) ? "仪式完成，开始专注" : "请先完成所有准备动作"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Post-Session Rating Drawer */}
      <AnimatePresence>
        {showRating && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-6 z-50 shadow-2xl flex flex-col transition-colors pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-2">专注结束</h3>
                <p className="text-zinc-500 dark:text-zinc-400">本次有效时长：{formatTime(pendingStopData?.elapsed || 0)}</p>
              </div>

              <div className="mb-8">
                <p className="text-center text-sm font-medium mb-4">为这次专注的【质量与心流程度】打个分吧：</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={cn(
                        "p-2 rounded-full transition-transform hover:scale-110",
                        rating >= star ? "text-orange-400" : "text-zinc-200 dark:text-zinc-700"
                      )}
                    >
                      <Star size={36} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={confirmRatingAndStop}
                disabled={rating === 0}
                className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                保存记录并更新链条
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chains Drawer */}
      <AnimatePresence>
        {showChainsDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChainsDrawer(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-6 z-50 shadow-2xl flex flex-col transition-colors pb-safe max-h-[80vh]"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">切换专注链</h3>
                <button onClick={() => setShowChainsDrawer(false)} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 mb-6">
                {store.chains.map(chain => (
                  <div 
                    key={chain.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer group",
                      selectedChain === chain.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => {
                      setSelectedChain(chain.id);
                      setShowChainsDrawer(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        selectedChain === chain.id ? "border-blue-500" : "border-zinc-300 dark:border-zinc-600"
                      )}>
                        {selectedChain === chain.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <div>
                        <div className={cn(
                          "font-medium text-sm",
                          selectedChain === chain.id ? "text-blue-700 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"
                        )}>{chain.name}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          当前 {chain.currentLength} 连 • 最高 {chain.maxLength} 连
                        </div>
                      </div>
                    </div>
                    {store.chains.length > 1 && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedChain === chain.id) {
                            setSelectedChain(store.chains.find(c => c.id !== chain.id)?.id || '');
                          }
                          store.deleteChain(chain.id);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="新建链条名称 (如: 算法题)"
                    value={newChainName}
                    onChange={(e) => setNewChainName(e.target.value)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                  />
                  <button 
                    onClick={handleCreateChain}
                    disabled={!newChainName.trim()}
                    className="px-4 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsDrawer(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-colors"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl p-6 z-50 shadow-2xl flex flex-col transition-colors pb-safe"
            >
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 shrink-0" />
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">专注偏好设置</h3>
                <button onClick={() => setShowSettingsDrawer(false)} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">默认专注时长</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[25, 45, 60, 90, 120].map(m => (
                      <button
                        key={m}
                        onClick={() => handleUpdateSettings(m * 60)}
                        className={cn(
                          "py-3 rounded-xl border text-sm transition-colors",
                          settings.defaultFocusDuration === m * 60
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 font-medium"
                            : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        {m} 分钟
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Future settings can go here */}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
