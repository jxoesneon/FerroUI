import { describe, it, expect } from 'vitest';
import { createCommand } from './commands/create';
import { devCommand } from './commands/dev';
import { evalCommand } from './commands/eval';

describe('FerroUI CLI Command Registration', () => {
  it('should have standard commands registered', () => {
    expect(createCommand.name()).toBe('create');
    expect(devCommand.name()).toBe('dev');
    expect(evalCommand.name()).toBe('eval');
  });
});
