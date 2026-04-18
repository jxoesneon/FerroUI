import React from 'react';
import { KPICard } from './KPICard';
import type { MetricData } from '../types';

interface KPIBoardProps {
  metrics: MetricData[];
}

export const KPIBoard: React.FC<KPIBoardProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full" data-layout-panel="kpi-board">
      {metrics.map((metric, index) => (
        <KPICard key={index} data={metric} index={index} />
      ))}
    </div>
  );
};
