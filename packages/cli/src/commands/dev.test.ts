import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { devCommand } from './dev.js';
import { execa } from 'execa';
import { execSync } from 'node:child_process';
import fs from 'fs-extra';
import ora from 'ora';

vi.mock('execa');
vi.mock('node:child_process');
vi.mock('fs-extra');
vi.mock('ora');

describe('devCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraSucceedMock: Mock;
  let oraWarnMock: Mock;
  let oraFailMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    oraSucceedMock = vi.fn();
    oraWarnMock = vi.fn();
    oraFailMock = vi.fn();
    oraStartMock = vi.fn().mockReturnValue({
      succeed: oraSucceedMock,
      warn: oraWarnMock,
      fail: oraFailMock,
    });
    vi.mocked(ora).mockImplementation(() => ({ start: oraStartMock }) as any);

    vi.mocked(fs.existsSync).mockReturnValue(true); // pnpm-lock exists
    vi.mocked(fs.pathExists).mockResolvedValue(true as never); // apps/web, engine/dist, etc exist

    vi.mocked(execa).mockImplementation(() => {
      const mockProcess = Promise.resolve();
      (mockProcess as any).kill = vi.fn();
      return mockProcess as any;
    });
  });

  it('should start all services by default', async () => {
    await devCommand.parseAsync(['node', 'dev', '--no-open']);

    expect(oraStartMock).toHaveBeenCalled();

    // Verify Playground start
    expect(execa).toHaveBeenCalledWith('pnpm', expect.arrayContaining(['run', 'dev', '--', '--port', '3000']), expect.any(Object));
    
    // Verify Engine start
    expect(execa).toHaveBeenCalledWith('node', expect.arrayContaining([expect.stringContaining('server.js')]), expect.any(Object));
    
    // Verify Inspector start
    expect(execa).toHaveBeenCalledWith('node', expect.arrayContaining([expect.stringContaining('inspector.js'), '--port', '3002']), expect.any(Object));

    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Services started!'));
  });

  it('should start only engine if --engine-only is passed', async () => {
    await devCommand.parseAsync(['node', 'dev', '--engine-only', '--no-open']);

    expect(execa).not.toHaveBeenCalledWith('pnpm', expect.any(Array), expect.any(Object));
    expect(execa).toHaveBeenCalledWith('node', expect.arrayContaining([expect.stringContaining('server.js')]), expect.any(Object));
  });

  it('should start only renderer if --renderer-only is passed', async () => {
    await devCommand.parseAsync(['node', 'dev', '--renderer-only', '--no-open']);

    expect(execa).toHaveBeenCalledWith('pnpm', expect.arrayContaining(['run', 'dev']), expect.any(Object));
    expect(execa).not.toHaveBeenCalledWith('node', expect.arrayContaining([expect.stringContaining('server.js')]), expect.any(Object));
  });

  it('should detect yarn if yarn.lock exists', async () => {
    vi.mocked(fs.existsSync).mockImplementation((path: any) => {
      if (typeof path === 'string' && path.includes('yarn.lock')) return true;
      return false;
    });

    await devCommand.parseAsync(['node', 'dev', '--renderer-only', '--no-open']);

    expect(execa).toHaveBeenCalledWith('yarn', expect.arrayContaining(['run', 'dev']), expect.any(Object));
  });

  it('should detect npm if no lockfile exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await devCommand.parseAsync(['node', 'dev', '--renderer-only', '--no-open']);

    expect(execa).toHaveBeenCalledWith('npm', expect.arrayContaining(['run', 'dev']), expect.any(Object));
  });

  it('should use ts-node for src entries if dist is missing', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.includes('dist')) return false;
      return true;
    });

    await devCommand.parseAsync(['node', 'dev', '--no-open']);

    expect(execa).toHaveBeenCalledWith('npx', expect.arrayContaining(['ts-node', '--esm', expect.stringContaining('server.ts')]), expect.any(Object));
    expect(execa).toHaveBeenCalledWith('npx', expect.arrayContaining(['ts-node', '--esm', expect.stringContaining('inspector.ts')]), expect.any(Object));
  });

  it('should open browser if not disabled on all platforms and handle errors', async () => {
    vi.useFakeTimers();
    
    // Win32
    Object.defineProperty(process, 'platform', { value: 'win32' });
    let promise = devCommand.parseAsync(['node', 'dev']);
    await vi.runAllTimersAsync();
    await promise;
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('start http'), expect.any(Object));
    
    // Darwin
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    promise = devCommand.parseAsync(['node', 'dev']);
    await vi.runAllTimersAsync();
    await promise;
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('open http'), expect.any(Object));

    // Linux
    Object.defineProperty(process, 'platform', { value: 'linux' });
    promise = devCommand.parseAsync(['node', 'dev']);
    await vi.runAllTimersAsync();
    await promise;
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('xdg-open http'), expect.any(Object));

    // Error
    vi.mocked(execSync).mockImplementationOnce(() => { throw new Error('no browser'); });
    promise = devCommand.parseAsync(['node', 'dev']);
    await vi.runAllTimersAsync();
    await promise;
    
    vi.useRealTimers();
  });

  it('should handle process failure and ignore errors when killing processes', async () => {
    let callCount = 0;
    const mockKill = vi.fn(() => { throw new Error('Kill failed'); });
    vi.mocked(execa).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        const mockProcess = Promise.resolve();
        (mockProcess as any).kill = mockKill;
        return mockProcess as any;
      }
      throw new Error('Spawn failed');
    });

    await devCommand.parseAsync(['node', 'dev', '--no-open']);

    expect(mockKill).toHaveBeenCalled();
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should warn if services are not found', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    await devCommand.parseAsync(['node', 'dev', '--no-open']);

    expect(oraWarnMock).toHaveBeenCalledWith(expect.stringContaining('apps/web not found'));
    expect(oraWarnMock).toHaveBeenCalledWith(expect.stringContaining('Engine entry not found'));
    expect(oraWarnMock).toHaveBeenCalledWith(expect.stringContaining('Registry inspector entry not found'));
  });

  it('should handle process failure', async () => {
    vi.mocked(execa).mockImplementation(() => {
      throw new Error('Spawn failed');
    });

    await devCommand.parseAsync(['node', 'dev', '--no-open']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to start services.'));
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Spawn failed'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });
});
