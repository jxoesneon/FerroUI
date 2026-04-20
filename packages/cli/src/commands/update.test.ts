import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { updateCommand } from './update.js';
import { execSync } from 'child_process';
import prompts from 'prompts';
import ora from 'ora';

vi.mock('child_process');
vi.mock('prompts');
vi.mock('ora');

describe('updateCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraStopMock: Mock;
  let oraSucceedMock: Mock;
  let oraFailMock: Mock;

  beforeEach(() => {
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    oraStopMock = vi.fn();
    oraSucceedMock = vi.fn();
    oraFailMock = vi.fn();
    oraStartMock = vi.fn().mockReturnValue({
      stop: oraStopMock,
      succeed: oraSucceedMock,
      fail: oraFailMock,
    });
    vi.mocked(ora).mockImplementation(() => ({ start: oraStartMock }) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully update to latest version without prompt if --yes is passed', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        return '"2.0.0"';
      }
      return '';
    });

    await updateCommand.parseAsync(['node', 'update', '--yes', '--pkg-manager', 'npm']);

    expect(ora).toHaveBeenCalledWith('Checking for updates...');
    expect(execSync).toHaveBeenCalledWith(expect.stringContaining('npm view ferroui version'), expect.any(Object));
    expect(execSync).toHaveBeenCalledWith('npm install -g ferroui@latest', expect.any(Object));
    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
  });

  it('should handle same version case', async () => {
    // We expect the current version to be "1.0.0" (or similar) from package.json
    // We will return exactly what current version is to match it
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        return '"1.0.0"'; // Assuming current version in package.json is 1.0.0
      }
      return '';
    });

    await updateCommand.parseAsync(['node', 'update']);

    // Since the mocked latestVersion is 1.0.0, they should match
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Already up to date.'));
    expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('add -g'));
  });

  it('should prompt for confirmation and cancel if user says no', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        return '"2.0.0"';
      }
      return '';
    });

    vi.mocked(prompts).mockResolvedValue({ confirmed: false });

    await updateCommand.parseAsync(['node', 'update']);

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Update cancelled.'));
    expect(execSync).not.toHaveBeenCalledWith(expect.stringContaining('add -g'));
  });

  it('should prompt for confirmation and proceed if user says yes with yarn', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        return '"2.0.0"';
      }
      if (typeof cmd === 'string' && cmd.includes('--version')) {
        return '2.0.0';
      }
      return '';
    });

    vi.mocked(prompts).mockResolvedValue({ confirmed: true });

    await updateCommand.parseAsync(['node', 'update', '--pkg-manager', 'yarn']);

    expect(execSync).toHaveBeenCalledWith('yarn global add ferroui@latest', expect.any(Object));
    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Installed version: 2.0.0'));
  });

  it('should handle network error when checking versions', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        throw new Error('Network error');
      }
      return '';
    });

    await updateCommand.parseAsync(['node', 'update', '--yes']);

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('unknown'));
    expect(execSync).toHaveBeenCalledWith('pnpm add -g ferroui@latest', expect.any(Object));
  });

  it('should handle install error', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('npm view')) {
        return '"2.0.0"';
      }
      if (typeof cmd === 'string' && cmd.includes('add -g')) {
        throw new Error('Install failed');
      }
      return '';
    });

    await updateCommand.parseAsync(['node', 'update', '--yes']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Update failed.'));
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Install failed'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });
});
