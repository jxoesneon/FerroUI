import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promptCommand } from '../prompt.js';
import * as fs from 'node:fs/promises';
import { execSync } from 'node:child_process';

vi.mock('node:fs/promises');
vi.mock('node:child_process');
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
  })),
}));

describe('Prompt CLI Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('lists available prompt versions', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { isDirectory: () => true, name: 'v1.0' },
        { isDirectory: () => true, name: 'v1.1' },
      ] as any);
      vi.mocked(fs.readFile).mockResolvedValue('1.0');

      await promptCommand.parseAsync(['node', 'test', 'list']);

      expect(fs.readdir).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('handles no versions found', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await promptCommand.parseAsync(['node', 'test', 'list']);

      expect(fs.readdir).toHaveBeenCalled();
    });
  });

  describe('diff', () => {
    it('shows differences between two versions', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(execSync).mockReturnValue('diff output' as any);

      await promptCommand.parseAsync(['node', 'test', 'diff', '1.0', '1.1']);

      expect(fs.access).toHaveBeenCalledTimes(2);
      expect(execSync).toHaveBeenCalledWith(expect.stringContaining('diff -u -r'), expect.any(Object));
    });

    it('fails if a version does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await promptCommand.parseAsync(['node', 'test', 'diff', '1.0', '2.0']);

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('rollback', () => {
    it('pins the engine to a specific version', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await promptCommand.parseAsync(['node', 'test', 'rollback', '1.1']);

      expect(fs.access).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(expect.stringContaining('.prompt-version'), '1.1', 'utf-8');
    });

    it('fails if version to rollback does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await promptCommand.parseAsync(['node', 'test', 'rollback', '3.0']);

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });
});
