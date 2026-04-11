import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCommand } from '../generate';
import fs from 'fs-extra';
import ora from 'ora';

vi.mock('fs-extra');
vi.mock('ora', () => {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: ''
  };
  return { default: vi.fn(() => spinner) };
});

describe('generateCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('component', () => {
    it('should fail if directory already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);
      await generateCommand.parseAsync(['node', 'test', 'component', 'button']);
      const oraInstance = (ora as any)();
      expect(oraInstance.fail).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should generate component successfully', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.readFile).mockResolvedValue('template content');
      await generateCommand.parseAsync(['node', 'test', 'component', 'button']);
      const oraInstance = (ora as any)();
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(6); // index, schema, types, readme, stories, tests
      expect(oraInstance.succeed).toHaveBeenCalled();
    });

    it('should handle component generation failure', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.ensureDir).mockRejectedValueOnce(new Error('Mock Error'));
      await generateCommand.parseAsync(['node', 'test', 'component', 'button']);
      const oraInstance = (ora as any)();
      expect(oraInstance.fail).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Mock Error');
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should generate component without stories and tests', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.readFile).mockResolvedValue('template content');
      await generateCommand.parseAsync(['node', 'test', 'component', 'button', '--no-stories', '--no-tests']);
      const oraInstance = (ora as any)();
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(4); // index, schema, types, readme
      expect(oraInstance.succeed).toHaveBeenCalled();
    });
  });

  describe('tool', () => {
    it('should fail if directory already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(true);
      await generateCommand.parseAsync(['node', 'test', 'tool', 'fetchData']);
      const oraInstance = (ora as any)();
      expect(oraInstance.fail).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should generate tool successfully', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.readFile).mockResolvedValue('template content');
      await generateCommand.parseAsync(['node', 'test', 'tool', 'fetchData']);
      const oraInstance = (ora as any)();
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(5); // index, schema, test, readme, mock
      expect(oraInstance.succeed).toHaveBeenCalled();
    });

    it('should generate tool without mock', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.readFile).mockResolvedValue('template content');
      await generateCommand.parseAsync(['node', 'test', 'tool', 'fetchData', '--no-mock']);
      const oraInstance = (ora as any)();
      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledTimes(4); // index, schema, test, readme
      expect(oraInstance.succeed).toHaveBeenCalled();
    });

    it('should handle tool generation failure', async () => {
      vi.mocked(fs.existsSync).mockReturnValueOnce(false);
      vi.mocked(fs.ensureDir).mockRejectedValueOnce(new Error('Mock Error'));
      await generateCommand.parseAsync(['node', 'test', 'tool', 'fetchData']);
      const oraInstance = (ora as any)();
      expect(oraInstance.fail).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Mock Error');
      expect(exitMock).toHaveBeenCalledWith(1);
    });
  });
});
