import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { migrateCommand } from './migrate.js';
import fs from 'fs-extra';
import { globby } from 'globby';
import { validateLayout } from '@ferroui/schema';
import { registry } from '@ferroui/registry';

vi.mock('fs-extra');
vi.mock('globby');
vi.mock('@ferroui/schema');
vi.mock('@ferroui/registry', () => ({
  registry: {
    getComponentEntry: vi.fn(),
  }
}));

describe('migrateCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation(((code: any) => { throw new Error(`Exit ${code}`); }) as any);

    vi.mocked(fs.readJson).mockResolvedValue({} as never);
    vi.mocked(fs.writeJson).mockResolvedValue(undefined as never);
    vi.mocked(globby).mockResolvedValue(['test.json']);
    vi.mocked(validateLayout).mockReturnValue({ valid: true } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('component type', () => {
    it('should exit if --from and --to are not provided', async () => {
      await expect(migrateCommand.parseAsync(['node', 'migrate', 'component'])).rejects.toThrow('Exit 1');

      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('requires --from and --to versions'));
    });

    it('should exit if source component is not found', async () => {
      vi.mocked(registry.getComponentEntry).mockReturnValueOnce(undefined);

      await expect(migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2'])).rejects.toThrow('Exit 1');

      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Source component not found'));
    });

    it('should exit if target component is not found', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValueOnce({ schema: { shape: {} } } as any) // from
        .mockReturnValueOnce(undefined); // to

      await expect(migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2'])).rejects.toThrow('Exit 1');

      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Target component not found'));
    });

    it('should migrate component successfully', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValueOnce({ schema: { shape: { title: true } } } as any) // from
        .mockReturnValueOnce({ schema: { shape: { title: true, subtitle: true } } } as any); // to

      vi.mocked(fs.readJson).mockResolvedValue({ type: 'DataCard', title: 'Test' } as never);

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2']);

      expect(fs.writeJson).toHaveBeenCalledWith(
        'test.json',
        { type: 'DataCard', title: 'Test' },
        { spaces: 2 }
      );
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('+ New properties: subtitle'));
    });

    it('should respect --dry-run option', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValue({ schema: { shape: {} } } as any);

      vi.mocked(fs.readJson).mockResolvedValue({ type: 'DataCard' } as never);

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2', '--dry-run']);

      expect(fs.writeJson).not.toHaveBeenCalled();
    });

    it('should handle validation failure', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValue({ schema: { shape: {} } } as any);

      vi.mocked(fs.readJson).mockResolvedValue({ type: 'DataCard' } as never);
      vi.mocked(validateLayout).mockReturnValue({ valid: false, errors: [{ message: 'Invalid prop' }] } as any);

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2']);

      expect(fs.writeJson).not.toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Error: Validation failed: Invalid prop'));
    });

    it('should migrate component and log removed properties', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValueOnce({ schema: { shape: { title: true, subtitle: true } } } as any) // from
        .mockReturnValueOnce({ schema: { shape: { title: true } } } as any); // to

      vi.mocked(fs.readJson).mockResolvedValue({ type: 'DataCard', title: 'Test' } as never);

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2']);

      expect(fs.writeJson).toHaveBeenCalled();
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('- Removed properties: subtitle'));
    });

    it('should skip layout file if no matching components are found', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValue({ schema: { shape: {} } } as any);

      vi.mocked(fs.readJson).mockResolvedValue({ type: 'OtherCard' } as never);

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('No matching components found'));
    });

    it('should catch error when readJson fails for component migrate', async () => {
      vi.mocked(registry.getComponentEntry)
        .mockReturnValueOnce({ schema: { shape: {} } } as any) // from
        .mockReturnValueOnce({ schema: { shape: {} } } as any); // to

      vi.mocked(fs.readJson).mockRejectedValue(new Error('Component migrate read fail'));

      await migrateCommand.parseAsync(['node', 'migrate', 'component', '--from', 'DataCard@1', '--to', 'DataCard@2']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Error: Component migrate read fail'));
    });
  });

  describe('layout type', () => {
    it('should catch error when readJson fails for auto-migrate', async () => {
      vi.mocked(fs.readJson).mockRejectedValue(new Error('Failed to read json'));

      await migrateCommand.parseAsync(['node', 'migrate', 'layout', './layouts']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Error: Failed to read json'));
    });

    it('should auto-migrate layouts based on deprecated components', async () => {
      vi.mocked(fs.readJson).mockResolvedValue({
        layout: {
          type: 'OldCard',
          children: []
        }
      } as never);

      vi.mocked(registry.getComponentEntry).mockImplementation((type: string) => {
        if (type === 'OldCard') return { deprecated: true, replacement: 'NewCard', schema: {} } as any;
        return undefined;
      });

      await migrateCommand.parseAsync(['node', 'migrate', 'layout', './layouts']);

      expect(fs.writeJson).toHaveBeenCalledWith(
        'test.json',
        { layout: { type: 'NewCard', children: [] } },
        { spaces: 2 }
      );
    });

    it('should skip layout file if no deprecated components are found', async () => {
      vi.mocked(fs.readJson).mockResolvedValue({
        layout: {
          type: 'GoodCard',
          children: []
        }
      } as never);

      vi.mocked(registry.getComponentEntry).mockImplementation((type: string) => undefined);

      await migrateCommand.parseAsync(['node', 'migrate', 'layout', './layouts']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('No deprecated components found'));
    });

    it('should handle validation failure during auto-migration', async () => {
      vi.mocked(fs.readJson).mockResolvedValue({
        layout: {
          type: 'OldCard',
          children: []
        }
      } as never);

      vi.mocked(registry.getComponentEntry).mockImplementation((type: string) => {
        if (type === 'OldCard') return { deprecated: true, replacement: 'NewCard', schema: {} } as any;
        return undefined;
      });

      vi.mocked(validateLayout).mockReturnValue({ valid: false, errors: [{ message: 'Auto migrate valid fail' }] } as any);

      await migrateCommand.parseAsync(['node', 'migrate', 'layout', './layouts']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Auto migrate valid fail'));
    });

    it('should traverse safely with missing component type and duplicate components', async () => {
      vi.mocked(fs.readJson).mockResolvedValue({
        layout: {
          type: 'OldCard',
          children: [
            { noTypeHere: true },
            { type: 'OldCard' },
            { type: 'NoReplacementCard' }
          ]
        }
      } as never);

      vi.mocked(registry.getComponentEntry).mockImplementation((type: string) => {
        if (type === 'OldCard') return { deprecated: true, replacement: 'NewCard', schema: {} } as any;
        if (type === 'NoReplacementCard') return { deprecated: true, replacement: undefined, schema: {} } as any;
        return undefined;
      });

      vi.mocked(validateLayout).mockReturnValue({ valid: true } as any);

      await migrateCommand.parseAsync(['node', 'migrate', 'layout', './layouts']);

      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('OldCard → NewCard'));
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('NoReplacementCard (no replacement available)'));
    });

    it('should output unknown migration type', async () => {
      await expect(migrateCommand.parseAsync(['node', 'migrate', 'unknown-type'])).rejects.toThrow('Exit 1');

      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Unknown migration type: unknown-type'));
    });
  });
});
