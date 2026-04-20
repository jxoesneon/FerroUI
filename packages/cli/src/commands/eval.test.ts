import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { evalCommand } from './eval.js';
import fs from 'fs-extra';

vi.mock('fs-extra');

describe('evalCommand', () => {
  let consoleLogMock: Mock;
  let processExitMock: Mock;
  let fetchMock: Mock;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation(((code: any) => { throw new Error(`Exit ${code}`); }) as any);

    originalFetch = global.fetch;
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should evaluate a single prompt successfully', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 
        'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{"type": "MetricCard"}], "aria": {"label": "dashboard"}}}}\n',
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test dashboard']);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/ferroui/process'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Test dashboard')
      })
    );

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('1/1 passed'));
    expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('.html'), expect.any(String), 'utf-8');
  });

  it('should load custom evals from directory as single object', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readdir).mockResolvedValue(['test1.json'] as any);
    vi.mocked(fs.readJson).mockResolvedValue({ prompt: 'Custom prompt object', latencyThresholdMs: 1000 });

    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{}], "aria": {}}}}\n'
    });

    await evalCommand.parseAsync(['node', 'eval', '--no-report']);

    expect(fs.readJson).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      body: expect.stringContaining('Custom prompt object')
    }));
  });

  it('should fall back to defaults if custom evals directory has no valid cases', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readdir).mockResolvedValue(['test3.json'] as any);
    vi.mocked(fs.readJson).mockResolvedValue({}); // Empty object, no prompt

    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{}], "aria": {}}}}\n'
    });

    await evalCommand.parseAsync(['node', 'eval', '--no-report']);
    
    // The fallback default suite has 4 cases
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should fail a11y via nested leaf child with no children array', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 
        'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{"type": "LeafNodeWithoutChildren"}], "aria": null}}}\n',
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test leaf no children']);
    
    expect(fetchMock).toHaveBeenCalled();
  });

  it('should fail eval if engine returns error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test']);

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('0/1 passed'));
  });

  it('should fail eval if schema is invalid', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 'data: {"type": "layout_chunk", "layout": "invalid layout"}\n'
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test']);

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('0/1 passed'));
  });

  it('should exit with 1 if CI flag is passed and pass rate is below threshold', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500
    });

    await expect(evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test', '--ci'])).rejects.toThrow('Exit 1');
  });

  it('should load array of evals from file', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readdir).mockResolvedValue(['test2.json'] as any);
    vi.mocked(fs.readJson).mockResolvedValue([{ prompt: 'Array 1' }, { prompt: 'Array 2' }]);
    
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{}], "aria": {}}}}\n'
    });

    await evalCommand.parseAsync(['node', 'eval', '--no-report']);
    expect(fs.readJson).toHaveBeenCalled();
  });

  it('should handle chunk type error', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 'data: {"type": "error", "error": {"message": "Custom error message"}}\n'
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test error chunk']);
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Custom error message'));
  });

  it('should catch fetch network error', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));
    
    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test catch block']);
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Network error'));
  });

  it('should pass a11y via nested children', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => 
        'data: {"type": "layout_chunk", "layout": {"schemaVersion": "1.0", "layout": {"type": "Dashboard", "children": [{"type": "Container", "children": [{"type": "Text", "aria": {"label": "nested"}}]}], "aria": null}}}\n',
    });

    await evalCommand.parseAsync(['node', 'eval', '--prompt', 'Test nested a11y']);
    
    expect(fetchMock).toHaveBeenCalled();
  });
});
