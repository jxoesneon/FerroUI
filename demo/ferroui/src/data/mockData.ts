import type { ProxyConnection, MetricData } from '../types';

export const PROXY_CONNECTIONS: ProxyConnection[] = [
  { id: 'PXY-001', origin: 'us-east-1', destination: 'eu-west-2', latency: '42ms', status: 'Online', uptime: '99.97%' },
  { id: 'PXY-002', origin: 'ap-south-1', destination: 'us-west-1', latency: '187ms', status: 'Degraded', uptime: '98.12%' },
  { id: 'PXY-003', origin: 'eu-central-1', destination: 'ap-east-1', latency: '91ms', status: 'Online', uptime: '99.84%' },
  { id: 'PXY-004', origin: 'us-west-2', destination: 'sa-east-1', latency: '203ms', status: 'Offline', uptime: '0%' },
  { id: 'PXY-005', origin: 'eu-north-1', destination: 'us-east-2', latency: '38ms', status: 'Online', uptime: '99.99%' },
];

export const TIME_SERIES_DATA = [340, 420, 380, 510, 620, 580, 720, 690, 810, 780, 842, 800];

export const METRICS_DATA: MetricData[] = [
  { label: 'CPU Load', value: '73.2', trend: '2.1%', trendDirection: 'up' },
  { label: 'Memory Usage', value: '12.4', trend: 'Stable', trendDirection: 'stable' },
  { label: 'Network I/O', value: '842', trend: '5.3%', trendDirection: 'down' }
];

export const MOCK_COMMAND = "Run a full diagnostic on the proxy server cluster and show active connections.";
