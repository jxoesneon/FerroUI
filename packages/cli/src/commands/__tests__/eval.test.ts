import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evalCommand } from '../eval';

describe('evalCommand', () => {
  let exitMock: any;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    exitMock = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fail if prompt is not provided', async () => {
    await evalCommand.parseAsync(['node', 'test']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Error: Prompt is required'));
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('should evaluate successfully', async () => {
    await evalCommand.parseAsync(['node', 'test', '-p', 'test-prompt']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Evaluating prompt'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('OVERALL SCORE'));
  });
});
