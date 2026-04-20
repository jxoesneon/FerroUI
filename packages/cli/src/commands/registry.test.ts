import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { registryCommand } from './registry.js';
import { execSync } from 'child_process';
import ora from 'ora';

vi.mock('child_process');
vi.mock('ora');
vi.mock('execa', () => ({
  execaNode: vi.fn(),
}));

describe('registryCommand', () => {
  let consoleLogMock: Mock;
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraSucceedMock: Mock;
  let oraFailMock: Mock;
  
  // To test the dynamic import of execa
  let execaNodeMock: Mock;

  beforeEach(async () => {
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

    const execa = await import('execa');
    execaNodeMock = execa.execaNode as Mock;
    execaNodeMock.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('inspect', () => {
    it('should start registry inspector successfully without opening browser', async () => {
      await registryCommand.parseAsync(['node', 'registry', 'inspect', '--port', '4000', '--no-open']);

      expect(oraStartMock).toHaveBeenCalled();
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Registry Inspector started at'));
      expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('Press Ctrl+C to stop.'));
      expect(execSync).not.toHaveBeenCalled();
      expect(execaNodeMock).toHaveBeenCalledWith(
        expect.stringContaining('inspector.js'),
        ['--port', '4000'],
        { stdio: 'inherit' }
      );
    });

    it('should attempt to open browser if not disabled', async () => {
      // Mock platform to a predictable one for the test
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      await registryCommand.parseAsync(['node', 'registry', 'inspect']);

      expect(execSync).toHaveBeenCalledWith('open http://localhost:3002', { stdio: 'ignore' });
      expect(execaNodeMock).toHaveBeenCalled();

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should ignore browser open errors', async () => {
      vi.mocked(execSync).mockImplementationOnce(() => { throw new Error('Browser failed'); });
      
      await registryCommand.parseAsync(['node', 'registry', 'inspect']);
      
      expect(execaNodeMock).toHaveBeenCalled(); // Should still start inspector
    });

    it('should handle inspector start failure', async () => {
      execaNodeMock.mockRejectedValueOnce(new Error('Start failed'));

      await registryCommand.parseAsync(['node', 'registry', 'inspect']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to start registry inspector.'));
      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Start failed'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('export', () => {
    it('should export documentation successfully', async () => {
      vi.mocked(execSync).mockReturnValue(Buffer.from(''));

      await registryCommand.parseAsync(['node', 'registry', 'export', '--output', './custom/docs']);

      expect(oraStartMock).toHaveBeenCalled();
      expect(execSync).toHaveBeenCalledWith('npm run docs:generate', { stdio: 'ignore' });
      expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Documentation exported to ./custom/docs'));
    });

    it('should handle export failure', async () => {
      vi.mocked(execSync).mockImplementation(() => { throw new Error('Export failed'); });

      await registryCommand.parseAsync(['node', 'registry', 'export']);

      expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to export documentation.'));
      expect(processExitMock).toHaveBeenCalledWith(1);
    });
  });
});
