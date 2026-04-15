import { describe, it, expect } from 'vitest';
import { ActionSchema } from '../src/types';

describe('ActionSchema', () => {
  it('should validate a NAVIGATE action', () => {
    const action = {
      type: 'NAVIGATE',
      payload: { path: '/home', params: { id: 123 } }
    };
    const result = ActionSchema.safeParse(action);
    expect(result.success).toBe(true);
  });

  it('should validate a STATE_UPDATE action', () => {
    const action = {
      type: 'STATE_UPDATE',
      payload: { componentId: 'comp-1', newState: 'expanded' }
    };
    const result = ActionSchema.safeParse(action);
    expect(result.success).toBe(true);
  });

  it('should fail on invalid action type', () => {
    const action = {
      type: 'INVALID_ACTION',
      payload: {}
    };
    const result = ActionSchema.safeParse(action);
    expect(result.success).toBe(false);
  });
});
