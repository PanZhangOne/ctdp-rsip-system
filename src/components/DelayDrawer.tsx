import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFocusStore } from '../store/useFocusStore';
import { formatTime } from '../utils/formatTime';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DelayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DelayDrawer: React.FC<DelayDrawerProps> = ({ isOpen, onClose }) => {
  const [intensity, setIntensity] = useState<number>(5);
  const [delayLevel, setDelayLevel] = useState<30 | 120 | 300>(30);
  const [isDelaying, setIsDelaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const recordUrge = useFocusStore(s => s.recordUrge);

  useEffect(() => {
    if (isOpen) {
      setIntensity(5);
      setDelayLevel(30);
      setIsDelaying(false);
      setTimeLeft(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: number;
    if (isDelaying && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [isDelaying, timeLeft]);

  const handleStartDelay = () => {
    setTimeLeft(delayLevel);
    setIsDelaying(true);
  };

  const handleOutcome = (outcome: 'overcome' | 'yielded') => {
    recordUrge(intensity, delayLevel, outcome);
    onClose();
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-colors"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 glass-drawer p-6 z-50 flex flex-col text-zinc-900 dark:text-zinc-100 transition-colors pb-safe"
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-6 transition-colors" />
            
            {!isDelaying ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">我想分心了</h2>
                  <button onClick={onClose} className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 transition-colors">冲动强度: {intensity}</label>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={intensity}
                    onChange={e => setIntensity(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none h-2 transition-colors"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1 transition-colors">
                    <span>轻微</span>
                    <span>难以忍受</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2 transition-colors">选择时延时间 (不打断计时)</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[30, 120, 300].map(time => (
                      <button
                        key={time}
                        onClick={() => setDelayLevel(time as any)}
                        className={cn(
                          "py-3 rounded-xl border transition-colors",
                          delayLevel === time 
                            ? "bg-blue-600 border-blue-500 text-white" 
                            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        )}
                      >
                        {time < 60 ? `${time}秒` : `${time/60}分钟`}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleStartDelay}
                  className="w-full py-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors mt-4"
                >
                  开始时延
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 space-y-8">
                <Flame size={48} className={cn("text-orange-500 animate-pulse transition-colors", timeLeft === 0 && "text-zinc-400 dark:text-zinc-600")} />
                <div className="text-6xl font-light tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-zinc-500 dark:text-zinc-400 text-center transition-colors">
                  {timeLeft > 0 ? "感受这个冲动，观察它，不要急着行动" : "时延结束，冲动消退了吗？"}
                </div>
                
                {timeLeft === 0 && (
                  <div className="grid grid-cols-2 gap-4 w-full mt-8">
                    <button 
                      onClick={() => handleOutcome('yielded')}
                      className="py-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      还是想分心 (断链)
                    </button>
                    <button 
                      onClick={() => handleOutcome('overcome')}
                      className="py-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors"
                    >
                      扛过去了 (继续)
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
