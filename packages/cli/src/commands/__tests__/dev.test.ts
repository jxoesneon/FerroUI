import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devCommand } from '../dev';
import execa from 'execa';
import ora from 'ora';

vi.mock('fs-extra');
vi.mock('execa', () => ({
  default: vi.fn().mockResolvedValue({})
}));
vi.mock('ora', () => {
  const spinner = {
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: ''
  };
  return { default: vi.fn(() => spinner) };
});

describe('devCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should start dev services successfully', async () => {
    await devCommand.parseAsync(['node', 'test']);
    const oraInstance = (ora as any)();
    expect(execa).toHaveBeenCalledTimes(3);
    expect(oraInstance.succeed).toHaveBeenCalled();
  });

  it('should handle dev services failure', async () => {
    vi.mocked(execa).mockImplementationOnce(() => { throw new Error('Mock Error'); });
    await devCommand.parseAsync(['node', 'test']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Mock Error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
