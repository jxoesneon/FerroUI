import { describe, it, expect } from 'vitest';
import { ToolError } from './errors';

describe('ToolError', () => {
  it('should initialize with code and message', () => {
    const error = new ToolError('NOT_FOUND', 'Tool not found');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ToolError);
    expect(error.name).toBe('ToolError');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Tool not found');
    expect(error.data).toBeUndefined();
  });

  it('should initialize with data', () => {
    const data = { foo: 'bar' };
    const error = new ToolError('INVALID_PARAMS', 'Invalid', data);
    expect(error.data).toBe(data);
  });
});