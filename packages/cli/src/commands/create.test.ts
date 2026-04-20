import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { createCommand } from './create.js';
import { execSync } from 'child_process';
import prompts from 'prompts';
import fs from 'fs-extra';
import ora from 'ora';

vi.mock('child_process');
vi.mock('prompts');
vi.mock('fs-extra');
vi.mock('ora');

describe('createCommand', () => {
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
    processExitMock = vi.spyOn(process, 'exit').mockImplementation(((code: any) => { throw new Error(`Exit ${code}`); }) as any);

    oraSucceedMock = vi.fn();
    oraWarnMock = vi.fn();
    oraFailMock = vi.fn();
    oraStartMock = vi.fn().mockReturnValue({
      succeed: oraSucceedMock,
      warn: oraWarnMock,
      fail: oraFailMock,
    });
    vi.mocked(ora).mockImplementation(() => ({ start: oraStartMock }) as any);

    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeJson).mockResolvedValue(undefined as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
    
    vi.mocked(execSync).mockReturnValue(Buffer.from(''));
    vi.mocked(prompts).mockResolvedValue({}); // Default mock return
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit if directory already exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);

    await expect(createCommand.parseAsync(['node', 'create', 'my-app'])).rejects.toThrow('Exit 1');

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  });

  it('should cancel if prompt is cancelled', async () => {
    // prompts returns empty object if cancelled
    vi.mocked(prompts).mockImplementation((opts, options) => {
      if (options?.onCancel) options.onCancel(opts as any, {} as any);
      return Promise.resolve({});
    });

    await expect(createCommand.parseAsync(['node', 'create', 'my-app'])).rejects.toThrow('Exit 0');

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Cancelled.'));
  });

  it('should create project with defaults when no options passed', async () => {
    vi.mocked(prompts).mockResolvedValue({ template: 'default', pkgManager: 'pnpm' });

    await createCommand.parseAsync(['node', 'create', 'my-app']);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('my-app'));
    expect(fs.writeJson).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({ name: 'my-app' }),
      expect.any(Object)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('ferroui.config.ts'), expect.any(String));
    
    // Check git and install
    expect(execSync).toHaveBeenCalledWith('git init', expect.any(Object));
    expect(execSync).toHaveBeenCalledWith('pnpm install', expect.any(Object));
    
    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('created!'));
  });

  it('should respect cli flags over prompts', async () => {
    await createCommand.parseAsync(['node', 'create', 'my-app', '-t', 'minimal', '-p', 'yarn', '--no-git', '--no-install']);

    // Should not prompt since all required are passed via flags
    expect(prompts).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ type: null, name: 'template' }),
      expect.objectContaining({ type: null, name: 'pkgManager' }),
    ]), expect.any(Object));

    expect(execSync).not.toHaveBeenCalledWith('git init', expect.any(Object));
    expect(execSync).not.toHaveBeenCalledWith('yarn install', expect.any(Object));
  });

  it('should create full template with storybook', async () => {
    await createCommand.parseAsync(['node', 'create', 'my-app', '-t', 'full']);

    expect(fs.writeJson).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({
        devDependencies: expect.objectContaining({
          '@storybook/react': '^8.0.0'
        })
      }),
      expect.any(Object)
    );
  });

  it('should handle git initialization failure gracefully', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('git')) throw new Error('Git failed');
      return Buffer.from('');
    });

    await createCommand.parseAsync(['node', 'create', 'my-app', '-t', 'minimal']);

    expect(oraWarnMock).toHaveBeenCalledWith(expect.stringContaining('Could not initialize git'));
  });

  it('should handle install failure gracefully', async () => {
    vi.mocked(execSync).mockImplementation((cmd: any) => {
      if (typeof cmd === 'string' && cmd.includes('install')) throw new Error('Install failed');
      return Buffer.from('');
    });

    await createCommand.parseAsync(['node', 'create', 'my-app', '-t', 'minimal']);

    expect(oraWarnMock).toHaveBeenCalledWith(expect.stringContaining('Could not run "pnpm install"'));
  });

  it('should exit on file system error', async () => {
    vi.mocked(fs.ensureDir).mockRejectedValue(new Error('Permission denied'));

    await expect(createCommand.parseAsync(['node', 'create', 'my-app', '-t', 'minimal'])).rejects.toThrow('Exit 1');

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to create project.'));
    expect(consoleErrorMock).toHaveBeenCalledWith('Permission denied');
  });
});
