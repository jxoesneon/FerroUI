import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Network } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import type { MetricData } from '../types';

interface KPICardProps {
  data: MetricData;
  index: number;
}

export const KPICard: React.FC<KPICardProps> = ({ data, index }) => {
  const count = useCountUp(parseFloat(data.value), 0, 600, true);
  
  // Choose an icon based on label
  const getIcon = () => {
    const l = data.label.toLowerCase();
    if (l.includes('cpu')) return <Cpu className="w-5 h-5" />;
    if (l.includes('network')) return <Network className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 120, 
        damping: 14, 
        delay: index * 0.1 
      }}
      className="relative flex flex-col justify-between p-5 overflow-hidden border bg-gradient-to-br from-[#0D0D0F] to-[#141418] border-orange-700/50 rounded-br-xl rounded-tl-xl rounded-tr-sm rounded-bl-sm group"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
        backgroundImage: 'linear-gradient(to bottom right, #0D0D0F, #141418), url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.03%22/%3E%3C/svg%3E")',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Machined edge highlight */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/10" />
      
      {/* Circuit lines */}
      <div className="absolute top-0 inset-inline-end- w-12 h-12 border-t border-r border-amber-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 inset-inline-end- w-8 h-8 border-b border-r border-amber-600/30 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between relative z-10">
        <h3 className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          {data.label}
        </h3>
        <div className="text-amber-500 opacity-80">
          {getIcon()}
        </div>
      </div>
      
      <div className="mt-4 flex items-end justify-between relative z-10">
        <div className="text-3xl font-mono text-neutral-100 font-light tracking-tighter" style={{ textShadow: '0 0 10px rgba(255,255,255,0.1)'}}>
          {count.toFixed(data.label.includes('Usage') || data.label.includes('Load') ? 1 : 0)}
          {data.label.includes('Load') || data.label.includes('Usage') ? '%' : ''}
        </div>
        <div className={`text-[10px] font-mono mb-1 ${
          data.trendDirection === 'up' ? 'text-cyan-400' : 
          data.trendDirection === 'down' ? 'text-orange-500' : 'text-neutral-500'
        }`}>
          {data.trendDirection === 'up' ? '▲' : data.trendDirection === 'down' ? '▼' : '▬'} {data.trend}
        </div>
      </div>
    </motion.div>
  );
};
