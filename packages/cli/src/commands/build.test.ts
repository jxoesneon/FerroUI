import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { buildCommand } from './build.js';
import { spawnSync, execSync } from 'node:child_process';
import fs from 'fs-extra';
import ora from 'ora';

vi.mock('node:child_process');
vi.mock('fs-extra');
vi.mock('ora');

describe('buildCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraSucceedMock: Mock;
  let oraFailMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    oraSucceedMock = vi.fn();
    oraFailMock = vi.fn();
    oraStartMock = vi.fn().mockReturnValue({
      succeed: oraSucceedMock,
      fail: oraFailMock,
    });
    vi.mocked(ora).mockImplementation(() => ({ start: oraStartMock }) as any);

    vi.mocked(spawnSync).mockReturnValue({ status: 0 } as any);
    vi.mocked(execSync).mockReturnValue(Buffer.from(''));
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeJson).mockResolvedValue(undefined as never);
  });

  it('should successfully run a full build', async () => {
    await buildCommand.parseAsync(['node', 'build', '--output', 'custom-dist']);

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('FerroUI Production Build'));
    
    // Type check
    expect(spawnSync).toHaveBeenCalledWith('npx', ['tsc', '--noEmit'], expect.any(Object));
    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Type check passed'));

    // Check package build
    expect(fs.pathExists).toHaveBeenCalled();
    expect(spawnSync).toHaveBeenCalledWith('pnpm', ['run', 'build'], expect.any(Object));

    // Manifest generation
    expect(fs.writeJson).toHaveBeenCalledWith(
      expect.stringContaining('ferroui-manifest.json'),
      expect.objectContaining({ version: '1.0.0' }),
      expect.any(Object)
    );

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Build complete.'));
  });

  it('should abort if type check fails', async () => {
    vi.mocked(spawnSync).mockImplementation((cmd, args) => {
      if (cmd === 'npx' && args?.[0] === 'tsc') return { status: 1 } as any;
      return { status: 0 } as any;
    });

    await buildCommand.parseAsync(['node', 'build']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Type check failed'));
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Build aborted due to type errors.'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should use npm if pnpm is not available', async () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('command not found');
    });

    await buildCommand.parseAsync(['node', 'build', '--skip-typecheck']);

    expect(spawnSync).toHaveBeenCalledWith('npm', ['run', 'build'], expect.any(Object));
  });

  it('should handle package build failure', async () => {
    vi.mocked(spawnSync).mockImplementation((cmd, args) => {
      if (args?.includes('build')) return { status: 1 } as any;
      return { status: 0 } as any;
    });

    await buildCommand.parseAsync(['node', 'build', '--skip-typecheck']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to build'));
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Build completed with errors.'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should skip directories that do not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);

    await buildCommand.parseAsync(['node', 'build', '--skip-typecheck']);

    // Should only write manifest, not spawn any builds
    expect(spawnSync).not.toHaveBeenCalledWith(expect.anything(), ['run', 'build'], expect.any(Object));
    expect(fs.writeJson).toHaveBeenCalled();
  });
});
