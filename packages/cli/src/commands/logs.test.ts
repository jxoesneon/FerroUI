import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { logsCommand } from './logs.js';

describe('logsCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let fetchMock: Mock;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should exit if unknown service is provided', async () => {
    await logsCommand.parseAsync(['node', 'logs', '--service', 'unknown-service']);

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Unknown service "unknown-service"'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should fetch recent logs for default engine service', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          { type: 'info', timestamp: '2023-01-01T12:00:00Z', requestId: '1234567890', userId: 'user1', durationMs: 10 },
          { type: 'error', error: 'Something went wrong' },
          { toolName: 'test-tool', success: true }
        ]
      })
    });

    await logsCommand.parseAsync(['node', 'logs']);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/admin/logs?lines=50');
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Connecting to'));
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('12345678')); // requestId slice
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('10ms'));
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'));
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('tool='));
  });

  it('should fetch recent logs with json output', async () => {
    const events = [{ type: 'info', message: 'test' }];
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ events })
    });

    await logsCommand.parseAsync(['node', 'logs', '--json', '--lines', '10']);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/admin/logs?lines=10');
    expect(consoleLogMock).toHaveBeenCalledWith(JSON.stringify(events[0]));
  });

  it('should handle fetch failure for recent logs', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404
    });

    await logsCommand.parseAsync(['node', 'logs']);

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch logs: HTTP 404'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should handle fetch exception for recent logs', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    await logsCommand.parseAsync(['node', 'logs']);

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Cannot connect to service: Network error'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should stream logs when follow is true', async () => {
    // Setup a mock reader
    const mockReader = {
      read: vi.fn()
    };
    
    // First read returns some data
    mockReader.read.mockResolvedValueOnce({
      done: false,
      value: new TextEncoder().encode('data: {"type":"info","message":"test"}\n')
    });
    // Second read ends the stream
    mockReader.read.mockResolvedValueOnce({
      done: true,
      value: undefined
    });

    fetchMock.mockResolvedValue({
      ok: true,
      body: {
        getReader: () => mockReader
      }
    });

    await logsCommand.parseAsync(['node', 'logs', '--follow', '--service', 'registry']);

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3002/admin/logs?stream=true');
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Streaming logs...'));
    // It should have printed the log
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('info'));
  });

  it('should handle stream connection errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await logsCommand.parseAsync(['node', 'logs', '--follow']);

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Stream error: HTTP 500'));
  });
});
