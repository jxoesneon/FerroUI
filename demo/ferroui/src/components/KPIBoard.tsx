import React from 'react';
import { METRICS_DATA } from '../data/mockData';
import { KPICard } from './KPICard';

export const KPIBoard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full" data-layout-panel="kpi-board">
      {METRICS_DATA.map((metric, index) => (
        <KPICard key={index} data={metric} index={index} />
      ))}
    </div>
  );
};
