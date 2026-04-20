import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { generateCommand } from './generate.js';
import fs from 'fs-extra';
import ora from 'ora';
import Handlebars from 'handlebars';

vi.mock('fs-extra');
vi.mock('ora');
vi.mock('handlebars', () => {
  return {
    default: {
      compile: vi.fn(() => vi.fn(() => 'compiled template result')),
    }
  };
});

describe('generateCommand', () => {
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

    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
    vi.mocked(fs.readFile).mockResolvedValue('template content' as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('component', () => {
    it('should generate a full component successfully', async () => {
      await generateCommand.parseAsync(['node', 'generate', 'component', 'button', '--tier', 'atom']);

      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledTimes(6); // index, schema, types, README, stories, test
      expect(fs.writeFile).toHaveBeenCalledTimes(6);
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Generated'));
    });

    it('should fail if directory already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await generateCommand.parseAsync(['node', 'generate', 'component', 'button']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Component directory already exists'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });

    it('should respect --no-stories and --no-tests', async () => {
      await generateCommand.parseAsync(['node', 'generate', 'component', 'button', '--no-stories', '--no-tests']);

      expect(fs.readFile).toHaveBeenCalledTimes(4); // index, schema, types, README
      expect(fs.writeFile).toHaveBeenCalledTimes(4);
    });

    it('should handle fs errors gracefully', async () => {
      vi.mocked(fs.ensureDir).mockRejectedValue(new Error('Permission denied'));

      await generateCommand.parseAsync(['node', 'generate', 'component', 'button']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to generate component.'));
      expect(consoleErrorMock).toHaveBeenCalledWith('Permission denied');
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('tool', () => {
    it('should generate a full tool successfully', async () => {
      await generateCommand.parseAsync(['node', 'generate', 'tool', 'fetchData']);

      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledTimes(5); // index, schema, test, README, mock
      expect(fs.writeFile).toHaveBeenCalledTimes(5);
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Generated'));
    });

    it('should respect --no-mock flag', async () => {
      await generateCommand.parseAsync(['node', 'generate', 'tool', 'fetchData', '--no-mock']);

      expect(fs.readFile).toHaveBeenCalledTimes(4);
    });

    it('should fail if directory already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await generateCommand.parseAsync(['node', 'generate', 'tool', 'fetchData']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Tool directory already exists'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('prompt', () => {
    it('should generate a prompt successfully', async () => {
      await generateCommand.parseAsync(['node', 'generate', 'prompt', 'System Expert', '-v', '2']);

      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Generated system-expert'));
    });

    it('should fallback to default template if template file does not exist', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);

      await generateCommand.parseAsync(['node', 'generate', 'prompt', 'System Expert']);

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should fail if prompt file already exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      await generateCommand.parseAsync(['node', 'generate', 'prompt', 'System Expert']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Prompt file already exists'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });
});
