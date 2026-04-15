import React from 'react';
import { motion } from 'framer-motion';
import { PROXY_CONNECTIONS } from '../data/mockData';
import { Database } from 'lucide-react';

export const DataTable: React.FC<{ prompt?: string }> = ({ prompt = '' }) => {
  const data = React.useMemo(() => {
    const p = prompt.toLowerCase();
    if (p.includes('us 1') || p.includes('us-1') || p.includes('us-east-1') || p.includes('us-west-1')) {
      return PROXY_CONNECTIONS.filter(r => r.origin.includes('us-1') || r.origin.includes('us-east-1') || r.origin.includes('us-west-1') || 
                                           r.destination.includes('us-1') || r.destination.includes('us-east-1') || r.destination.includes('us-west-1'));
    }
    if (p.includes('offline')) {
      return PROXY_CONNECTIONS.filter(r => r.status === 'Offline');
    }
    if (p.includes('online')) {
      return PROXY_CONNECTIONS.filter(r => r.status === 'Online');
    }
    return PROXY_CONNECTIONS;
  }, [prompt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.5 }}
      data-layout-panel="data-table"
      className="col-span-1 md:col-span-3 lg:col-span-2 relative flex flex-col p-5 overflow-hidden border bg-gradient-to-br from-[#0D0D0F] to-[#141418] border-orange-700/50 rounded-br-xl rounded-tl-xl rounded-tr-sm rounded-bl-sm group"
      style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2 mb-4 border-b border-orange-900/30 pb-3">
        <Database className="w-4 h-4 text-amber-500" />
        <h3 className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
          Proxy Connections
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] font-mono">
          <thead className="text-[9px] uppercase text-amber-600/70 border-b border-neutral-800">
            <tr>
              <th className="px-3 py-2 font-normal">ID</th>
              <th className="px-3 py-2 font-normal">Origin</th>
              <th className="px-3 py-2 font-normal">Destination</th>
              <th className="px-3 py-2 font-normal">Latency</th>
              <th className="px-3 py-2 font-normal">Status</th>
              <th className="px-3 py-2 font-normal mt-1">Uptime</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr 
                key={i} 
                className="border-b border-neutral-900/50 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-purple-900/20 group/row"
              >
                <td className="px-3 py-3 text-neutral-400 group-hover/row:text-cyan-300 transition-colors">
                  {row.id}
                </td>
                <td className="px-3 py-3 text-neutral-500 group-hover/row:text-cyan-100 transition-colors">
                  {row.origin}
                </td>
                <td className="px-3 py-3 text-neutral-500 group-hover/row:text-cyan-100 transition-colors">
                  {row.destination}
                </td>
                <td className="px-3 py-3 text-neutral-400 group-hover/row:text-cyan-300 transition-colors">
                  {row.latency}
                </td>
                <td className="px-3 py-3">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                    row.status === 'Online' ? 'bg-green-900/20 text-green-400 border-green-900/30' :
                    row.status === 'Degraded' ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' :
                    'bg-red-900/20 text-red-400 border-red-900/30'
                  } group-hover/row:border-cyan-500/30 group-hover/row:text-cyan-300 transition-colors`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-neutral-500 group-hover/row:text-purple-300 transition-colors">
                  {row.uptime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
