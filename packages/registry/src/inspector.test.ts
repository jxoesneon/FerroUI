import { describe, it, expect, vi, afterEach } from 'vitest';
import { startRegistryInspector } from './inspector.js';
import { registry } from './registry.js';
import http from 'node:http';

vi.mock('node:http', () => {
  const server = {
    listen: vi.fn(),
    close: vi.fn(),
  } as any;
  return {
    default: {
      createServer: vi.fn((handler) => {
        server.handler = handler;
        return server;
      }),
    },
  };
});

// Need to mock registry.getAllComponents to return some components for branches
vi.mock('./registry.js', () => ({
  registry: {
    getAllComponents: vi.fn().mockReturnValue([
      { id: '1', name: 'Test', version: 1, tier: 'ATOM', deprecated: true, replacement: 'Test2', schema: { description: 'Desc' } },
      { id: '2', name: 'Test2', version: 1, tier: 'MOLECULE', deprecated: false, schema: {} }
    ])
  }
}));

describe('inspector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('startRegistryInspector returns server and listens', () => {
    const server = startRegistryInspector(3001);
    expect(server).toBeDefined();
    expect(server.listen).toHaveBeenCalledWith(3001, expect.any(Function));
    
    // Test listen callback
    const listenCallback = vi.mocked(server.listen).mock.calls[0][1];
    if (listenCallback) listenCallback();
  });

  it('startRegistryInspector default port', () => {
    const server = startRegistryInspector();
    expect(server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  it('handles /api requests', () => {
    startRegistryInspector(3001);
    const handler = (http.createServer as any).mock.results[0].value.handler;
    const req = { url: '/api' };
    const res = { writeHead: vi.fn(), end: vi.fn() };
    handler(req, res);
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.any(Object));
    expect(res.end).toHaveBeenCalled();
  });

  it('handles HTML requests', () => {
    startRegistryInspector(3001);
    const handler = (http.createServer as any).mock.results[0].value.handler;
    const req = { url: '/' };
    const res = { writeHead: vi.fn(), end: vi.fn() };
    handler(req, res);
    expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
    expect(res.end).toHaveBeenCalled();
  });

  it('handles HTML requests with no components', () => {
    vi.mocked(registry.getAllComponents).mockReturnValueOnce([]);
    startRegistryInspector(3001);
    const handler = (http.createServer as any).mock.results[0].value.handler;
    const req = { url: '/' };
    const res = { writeHead: vi.fn(), end: vi.fn() };
    handler(req, res);
    expect(res.end).toHaveBeenCalledWith(expect.stringContaining('No components currently registered.'));
  });
});
