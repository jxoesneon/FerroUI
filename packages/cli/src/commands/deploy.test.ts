import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { deployCommand } from './deploy.js';
import { execa } from 'execa';
import fs from 'fs-extra';
import ora from 'ora';

vi.mock('execa');
vi.mock('fs-extra');
vi.mock('ora');

describe('deployCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraSucceedMock: Mock;
  let oraFailMock: Mock;

  beforeEach(() => {
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

    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(execa).mockResolvedValue({ all: 'https://deployed-url.com' } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit if target is unknown', async () => {
    await deployCommand.parseAsync(['node', 'deploy', 'unknown-target']);

    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Unknown target "unknown-target"'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  it('should exit if dist directory does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    await deployCommand.parseAsync(['node', 'deploy', 'web']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Build directory not found'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });

  describe('Web Target', () => {
    it('should deploy to Vercel if available', async () => {
      vi.mocked(execa).mockImplementation(((cmd: any) => {
        if (cmd === 'vercel') return Promise.resolve({ all: 'https://vercel.com' } as any);
        if (cmd === 'netlify') return Promise.reject(new Error());
        return Promise.resolve({} as any);
      }) as any);

      await deployCommand.parseAsync(['node', 'deploy', 'web']);

      expect(execa).toHaveBeenCalledWith('vercel', ['--prod', '--yes'], expect.any(Object));
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Deployed to Vercel!'));
    });

    it('should deploy to Netlify if Vercel is not available', async () => {
      vi.mocked(execa).mockImplementation(((cmd: any) => {
        if (cmd === 'vercel') return Promise.reject(new Error());
        if (cmd === 'netlify') return Promise.resolve({ all: 'https://netlify.com' } as any);
        return Promise.resolve({} as any);
      }) as any);

      await deployCommand.parseAsync(['node', 'deploy', 'web']);

      expect(execa).toHaveBeenCalledWith('netlify', ['deploy', '--dir', expect.any(String), '--prod'], expect.any(Object));
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Deployed to Netlify!'));
    });

    it('should fail if no provider is found', async () => {
      vi.mocked(execa).mockImplementation(((() => Promise.reject) as any)(new Error()));

      await deployCommand.parseAsync(['node', 'deploy', 'web']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('No deployment provider found'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });

    it('should perform a dry run', async () => {
      vi.mocked(execa).mockImplementation(((cmd: any) => {
        if (cmd === 'vercel') return Promise.resolve({} as any);
        return Promise.reject(new Error());
      }) as any);

      await deployCommand.parseAsync(['node', 'deploy', 'web', '--dry-run']);

      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('[dry-run] Web deployment validated'));
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('vercel'));
    });
  });

  describe('Edge Target', () => {
    it('should fail if wrangler is not found', async () => {
      vi.mocked(execa).mockImplementation(((() => Promise.reject) as any)(new Error()));

      await deployCommand.parseAsync(['node', 'deploy', 'edge']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Wrangler CLI not found'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });

    it('should deploy using wrangler', async () => {
      vi.mocked(execa).mockImplementation(((cmd: any) => {
        if (cmd === 'wrangler') return Promise.resolve({ all: 'Success' } as any);
        return Promise.resolve({} as any);
      }) as any);

      await deployCommand.parseAsync(['node', 'deploy', 'edge', '--env', 'staging']);

      expect(execa).toHaveBeenCalledWith('wrangler', ['deploy', '--env', 'staging'], expect.any(Object));
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Deployed to Cloudflare Workers!'));
    });
  });

  describe('Desktop Target', () => {
    it('should fail if pnpm is not found', async () => {
      vi.mocked(execa).mockImplementation(((() => Promise.reject) as any)(new Error()));

      await deployCommand.parseAsync(['node', 'deploy', 'desktop']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('pnpm not found'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });

    it('should build desktop using tauri', async () => {
      vi.mocked(execa).mockImplementation(((cmd: any) => {
        if (cmd === 'pnpm') return Promise.resolve({} as any);
        return Promise.resolve({} as any);
      }) as any);

      await deployCommand.parseAsync(['node', 'deploy', 'desktop']);

      expect(execa).toHaveBeenCalledWith('pnpm', ['tauri', 'build'], expect.any(Object));
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Desktop app built!'));
    });

    it('should perform a dry run for desktop', async () => {
      vi.mocked(execa).mockClear();
      vi.mocked(execa).mockResolvedValue({} as any);

      await deployCommand.parseAsync(['node', 'deploy', 'desktop', '--dry-run']);

      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('[dry-run] Desktop build config validated'));
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Build dir:'));
      expect(execa).not.toHaveBeenCalledWith('pnpm', ['tauri', 'build'], expect.any(Object));
    });
  });
});
