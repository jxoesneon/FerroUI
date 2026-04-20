import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ChartPanelProps {
  timeSeries: number[];
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ timeSeries }) => {
  const max = Math.max(...timeSeries);
  const min = Math.min(...timeSeries);
  const range = max - min || 1;

  const width = 400;
  const height = 100;

  const pathData = timeSeries.map((value, index) => {
    const x = (index / (timeSeries.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.4 }}
      data-layout-panel="chart-panel"
      className="col-span-1 md:col-span-3 lg:col-span-1 relative flex flex-col p-5 overflow-hidden border bg-gradient-to-br from-[#0D0D0F] to-[#141418] border-orange-700/50 rounded-br-xl rounded-tl-xl rounded-tr-sm rounded-bl-sm group min-h-[200px]"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-amber-500" />
        <h3 className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          Latency Trend (ms)
        </h3>
      </div>
      
      <div className="flex-1 w-full relative mt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" /> {/* amber-600 */}
              <stop offset="100%" stopColor="#00FFFF" /> {/* cyan */}
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base Grid lines behind chart inside SVG */}
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
          
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#chartGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};
