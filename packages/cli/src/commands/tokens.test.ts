import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { tokensCommand } from './tokens.js';
import { execa } from 'execa';
import ora from 'ora';

vi.mock('execa');
vi.mock('ora');

describe('tokensCommand', () => {
  let consoleErrorMock: Mock;
  let processExitMock: Mock;
  let oraStartMock: Mock;
  let oraSucceedMock: Mock;
  let oraFailMock: Mock;

  beforeEach(() => {
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    oraSucceedMock = vi.fn();
    oraFailMock = vi.fn();
    oraStartMock = vi.fn().mockReturnValue({
      succeed: oraSucceedMock,
      fail: oraFailMock,
    });
    vi.mocked(ora).mockImplementation(() => ({ start: oraStartMock }) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should have correct name and description', () => {
    expect(tokensCommand.name()).toBe('tokens');
    expect(tokensCommand.description()).toBe('Manage design tokens and build pipeline.');
  });

  it('should execute build script successfully', async () => {
    vi.mocked(execa).mockResolvedValue({} as any);

    await tokensCommand.parseAsync(['node', 'tokens', 'build', '--output', 'custom/dir']);

    expect(ora).toHaveBeenCalledWith('Building design tokens...');
    expect(oraStartMock).toHaveBeenCalled();
    
    expect(execa).toHaveBeenCalledWith(
      'node',
      expect.arrayContaining([
        '--experimental-strip-types',
        expect.stringContaining('build.ts'),
        '--output',
        'custom/dir'
      ]),
      expect.objectContaining({ stdio: 'inherit' })
    );

    expect(oraSucceedMock).toHaveBeenCalledWith(expect.stringContaining('Design tokens built successfully!'));
  });

  it('should handle build script failure', async () => {
    vi.mocked(execa).mockRejectedValue(new Error('Execa failed'));

    await tokensCommand.parseAsync(['node', 'tokens', 'build', '--output', 'custom/dir']);

    expect(oraFailMock).toHaveBeenCalledWith(expect.stringContaining('Failed to build design tokens.'));
    expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining('Execa failed'));
    expect(processExitMock).toHaveBeenCalledWith(1);
  });
});
