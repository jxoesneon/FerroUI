import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import { main } from './validate';
import { validateLayout } from './index';

vi.mock('fs');
vi.mock('./index', () => ({
  validateLayout: vi.fn()
}));

const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('validate CLI wrapper (main)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fails if no input data', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('');
    main();
    expect(mockError).toHaveBeenCalledWith('Error: No input data provided.');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('fails if input data is whitespace', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('   ');
    main();
    expect(mockError).toHaveBeenCalledWith('Error: No input data provided.');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('fails if JSON is invalid', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
    main();
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Error: Failed to parse JSON input:'));
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('fails if validation fails (with rule)', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{"type":"Test"}');
    vi.mocked(validateLayout).mockReturnValue({
      valid: false,
      errors: [
        { path: 'type', message: 'Invalid type', rule: 'R001' }
      ]
    });
    main();
    expect(mockError).toHaveBeenCalledWith('✖ AlloyLayout validation failed:');
    expect(mockError).toHaveBeenCalledWith('  - [type]: Invalid type (R001)');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('fails if validation fails (without rule)', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{"type":"Test"}');
    vi.mocked(validateLayout).mockReturnValue({
      valid: false,
      errors: [
        { path: 'type', message: 'Invalid type' }
      ]
    });
    main();
    expect(mockError).toHaveBeenCalledWith('✖ AlloyLayout validation failed:');
    expect(mockError).toHaveBeenCalledWith('  - [type]: Invalid type');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('succeeds if validation passes', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{"type":"Test"}');
    vi.mocked(validateLayout).mockReturnValue({ valid: true, errors: [] });
    main();
    expect(mockLog).toHaveBeenCalledWith('✔ AlloyLayout is valid.');
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
