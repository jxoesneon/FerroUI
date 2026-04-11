import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCommand } from '../create';
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

describe('createCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail if directory already exists', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    await createCommand.parseAsync(['node', 'test', 'my-app']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('should create project successfully', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    await createCommand.parseAsync(['node', 'test', 'my-app']);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJson).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
    const oraInstance = (ora as any)();
    expect(oraInstance.succeed).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });

  it('should handle create failure', async () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    vi.mocked(fs.ensureDir).mockRejectedValueOnce(new Error('Mock Error'));
    await createCommand.parseAsync(['node', 'test', 'my-app']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Mock Error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
