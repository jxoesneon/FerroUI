export type Phase = 'idle' | 'expand' | 'input' | 'loading' | 'synthesis' | 'complete';

export interface ProxyConnection {
  id: string;
  origin: string;
  destination: string;
  latency: string;
  status: 'Online' | 'Degraded' | 'Offline';
  uptime: string;
}

export interface MetricData {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'stable';
}

export type ComponentType = 'kpi' | 'table' | 'chart';

export interface LayoutComponent {
  id: ComponentType;
  colSpan: string;
}
