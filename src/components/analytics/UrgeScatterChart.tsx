import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { useFocusStore } from '../../store/useFocusStore';
import { Flame } from 'lucide-react';
import { formatTime } from '../../utils/formatTime';

export const UrgeScatterChart = () => {
  const { historyUrges, historySessions } = useFocusStore();

  const data = useMemo(() => {
    // We want to plot X: Time elapsed in session when urge occurred, Y: Urge Intensity (1-10)
    // Z: Delay Level chosen (size of bubble)
    
    return historyUrges.map(urge => {
      const session = historySessions.find(s => s.id === urge.sessionId);
      if (!session || !session.startTime) return null;

      // Elapsed time in minutes when urge happened
      const elapsedMinutes = Math.round((urge.timestamp - session.startTime) / 60000);
      
      return {
        elapsed: elapsedMinutes,
        intensity: urge.intensity,
        delayLevel: urge.delayLevel,
        outcome: urge.outcome,
      };
    }).filter(Boolean);
  }, [historyUrges, historySessions]);

  const hasData = data.length > 0;

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        暂无分心冲动记录。
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-colors mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Flame size={18} className="text-orange-500" />
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">分心冲动分布图</h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        探索你在专注第几分钟时最容易产生放弃的冲动，以及当时选择的时延策略是否有效。
      </p>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
            <XAxis 
              type="number" 
              dataKey="elapsed" 
              name="发生时间" 
              unit="m" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              label={{ value: '专注进行到第几分钟', position: 'insideBottom', offset: -15, fill: '#a1a1aa', fontSize: 10 }}
            />
            <YAxis 
              type="number" 
              dataKey="intensity" 
              name="冲动强度" 
              domain={[0, 11]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              label={{ value: '冲动强度', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 10 }}
            />
            {/* ZAxis determines bubble size */}
            <ZAxis type="number" dataKey="delayLevel" range={[50, 400]} name="时延策略" />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-lg text-xs">
                      <div className="font-medium mb-2">在第 {data.elapsed} 分钟发生分心冲动</div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">自评强度:</span>
                        <span className="font-medium text-orange-500">{data.intensity} / 10</span>
                      </div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">选择时延:</span>
                        <span className="font-medium">{formatTime(data.delayLevel)}</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between mt-2">
                        <span className="font-medium">最终结果:</span>
                        <span className={data.outcome === 'overcome' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                          {data.outcome === 'overcome' ? '扛过去了' : '放弃断链'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Scatter 
              name="扛过去了" 
              data={data.filter(d => d.outcome === 'overcome')} 
              fill="#22c55e" 
              fillOpacity={0.6}
            />
            <Scatter 
              name="放弃断链" 
              data={data.filter(d => d.outcome === 'yielded')} 
              fill="#ef4444" 
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-zinc-500">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-green-500 opacity-60 inline-block"></span>
          <span>扛过去了</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500 opacity-60 inline-block"></span>
          <span>屈服分心</span>
        </div>
        <div className="flex items-center space-x-2 border-l border-zinc-200 dark:border-zinc-700 pl-4">
          <span className="w-3 h-3 rounded-full border border-zinc-400 inline-block"></span>
          <span className="w-4 h-4 rounded-full border border-zinc-400 inline-block"></span>
          <span>圆圈大小 = 选择的时延时间</span>
        </div>
      </div>
    </div>
  );
};