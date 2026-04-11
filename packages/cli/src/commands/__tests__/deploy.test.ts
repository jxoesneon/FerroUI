import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deployCommand } from '../deploy';
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

describe('deployCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail if build directory not found', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    await deployCommand.parseAsync(['node', 'test', 'web']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('should deploy successfully', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    await deployCommand.parseAsync(['node', 'test', 'web']);
    const oraInstance = (ora as any)();
    expect(oraInstance.succeed).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should handle deploy failure', async () => {
    vi.mocked(fs.existsSync).mockImplementationOnce(() => { throw new Error('Mock Error'); });
    await deployCommand.parseAsync(['node', 'test', 'web']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Mock Error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
