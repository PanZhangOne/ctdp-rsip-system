import React, { useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useSystemStore } from '../../store/useSystemStore';
import { useFocusStore } from '../../store/useFocusStore';
import { LayoutDashboard } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export const SystemCorrelationChart = () => {
  const { nodes } = useSystemStore();
  const { historySessions } = useFocusStore();

  const data = useMemo(() => {
    // Generate data for the last 7 days
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: d,
        label: format(d, 'MM-dd'),
        steadyIndex: 0,
        focusMinutes: 0,
      };
    });

    // 1. Calculate historical steady index (simplification: based on current lit nodes' litDate)
    // A node is considered LIT on a day if its litDate is <= that day and it's currently LIT
    // (A true historical state machine would require saving daily snapshots, this is an approximation)
    const totalNodes = nodes.length;
    
    if (totalNodes > 0) {
      days.forEach(day => {
        const eod = day.date.getTime() + 86400000;
        const litCount = nodes.filter(n => 
          n.data.status === 'LIT' && n.data.litDate && n.data.litDate <= eod
        ).length;
        day.steadyIndex = Math.round((litCount / totalNodes) * 100);
      });
    }

    // 2. Calculate daily focus minutes
    historySessions.forEach(session => {
      if (!session.startTime || session.state !== 'finished') return;
      
      const sessionDate = startOfDay(new Date(session.startTime)).getTime();
      const dayObj = days.find(d => d.date.getTime() === sessionDate);
      
      if (dayObj) {
        dayObj.focusMinutes += Math.round(session.actualDuration / 60);
      }
    });

    return days;
  }, [nodes, historySessions]);

  const hasData = historySessions.length > 0 || nodes.length > 0;

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 mt-6">
        需要建立国策树并完成几次专注后，才能进行相关性分析。
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-colors mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <LayoutDashboard size={18} className="text-purple-500" />
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">体系稳态与专注表现相关性</h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        观察你的底层习惯（国策树点亮比例）是如何影响你的高层脑力输出（专注时长）的。
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: -20 }}>
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
            />
            {/* Left Y-Axis for Focus Minutes */}
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              label={{ value: '专注(分钟)', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 10 }}
            />
            {/* Right Y-Axis for Steady Index */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }}
              label={{ value: '稳态指数(%)', angle: 90, position: 'insideRight', fill: '#a1a1aa', fontSize: 10 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-lg text-xs">
                      <div className="font-medium mb-2">{data.label}</div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">稳态指数:</span>
                        <span className="text-purple-500 font-medium">{data.steadyIndex}%</span>
                      </div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">有效专注:</span>
                        <span className="text-blue-500 font-medium">{data.focusMinutes} 分钟</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Bar for Focus Minutes (Left Axis) */}
            <Bar yAxisId="left" dataKey="focusMinutes" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} barSize={20} />
            
            {/* Line for Steady Index (Right Axis) */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="steadyIndex" 
              stroke="#a855f7" 
              strokeWidth={3} 
              dot={{ fill: '#a855f7', strokeWidth: 2, r: 4, stroke: 'white' }} 
              activeDot={{ r: 6 }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-zinc-500">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-blue-500 opacity-80 inline-block"></span>
          <span>每日有效专注 (左轴)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 rounded-full bg-purple-500 inline-block"></span>
          <span>体系稳态指数 (右轴)</span>
        </div>
      </div>
    </div>
  );
};
