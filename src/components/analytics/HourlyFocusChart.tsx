import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFocusStore } from '../../store/useFocusStore';
import { Clock } from 'lucide-react';

export const HourlyFocusChart = () => {
  const { historySessions } = useFocusStore();

  const data = useMemo(() => {
    // Initialize 24-hour buckets
    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      successCount: 0,
      failCount: 0,
      totalCount: 0,
    }));

    // Populate buckets
    historySessions.forEach(session => {
      if (!session.startTime) return;
      
      const hour = new Date(session.startTime).getHours();
      hourlyStats[hour].totalCount += 1;
      
      // Treat 'success' and 'degrade' as success for the purpose of the chart
      if (session.state === 'finished' && (session.actualDuration >= session.plannedDuration * 0.5)) {
        hourlyStats[hour].successCount += 1;
      } else {
        hourlyStats[hour].failCount += 1;
      }
    });

    return hourlyStats;
  }, [historySessions]);

  // Only show chart if there's data
  const hasData = data.some(d => d.totalCount > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        暂无专注记录，完成几次专注后再来查看生物钟规律吧。
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm transition-colors">
      <div className="flex items-center space-x-2 mb-4">
        <Clock size={18} className="text-blue-500" />
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">24小时生物钟热力分布</h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
        直观展示你在一天中哪个时段专注力最强，哪个时段最容易失败。
      </p>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="hour" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              interval={3}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#71717a' }} 
              allowDecimals={false}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(161, 161, 170, 0.1)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  if (data.totalCount === 0) return null;
                  const successRate = Math.round((data.successCount / data.totalCount) * 100);
                  return (
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl shadow-lg text-xs">
                      <div className="font-medium mb-2">{data.label} 时段</div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">总尝试:</span>
                        <span className="font-medium">{data.totalCount}次</span>
                      </div>
                      <div className="flex justify-between space-x-4 mb-1">
                        <span className="text-zinc-500 dark:text-zinc-400">成功:</span>
                        <span className="text-green-500 font-medium">{data.successCount}次</span>
                      </div>
                      <div className="flex justify-between space-x-4 mb-2">
                        <span className="text-zinc-500 dark:text-zinc-400">失败:</span>
                        <span className="text-red-500 font-medium">{data.failCount}次</span>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between">
                        <span className="font-medium">胜率:</span>
                        <span className={successRate > 50 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                          {successRate}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Stacked Bars: Success (Bottom) + Fail (Top) */}
            <Bar dataKey="successCount" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
            <Bar dataKey="failCount" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-zinc-500">
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span><span>成功</span></div>
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-sm bg-red-500 opacity-80 inline-block"></span><span>失败</span></div>
      </div>
    </div>
  );
};
