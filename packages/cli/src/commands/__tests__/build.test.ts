import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildCommand } from '../build';
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

describe('buildCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should build project successfully', async () => {
    await buildCommand.parseAsync(['node', 'test', '-o', 'dist']);
    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJson).toHaveBeenCalled();
    const oraInstance = (ora as any)();
    expect(oraInstance.succeed).toHaveBeenCalled();
  });

  it('should handle build failure', async () => {
    vi.mocked(fs.ensureDir).mockRejectedValueOnce(new Error('Mock Error'));
    await buildCommand.parseAsync(['node', 'test']);
    const oraInstance = (ora as any)();
    expect(oraInstance.fail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Mock Error');
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
