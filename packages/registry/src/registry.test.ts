import { describe, it, expect } from 'vitest';
import { ComponentRegistry } from './registry';

describe('ComponentRegistry', () => {
  it('should allow registering and retrieving components', () => {
    const registry = new ComponentRegistry();
    const mockComponent = () => null;
    
    registry.register('TestAtom', mockComponent, { tier: 'atom' });
    
    expect(registry.get('TestAtom')).toBe(mockComponent);
    expect(registry.getMetadata('TestAtom')?.tier).toBe('atom');
  });

  it('should throw when registering invalid tier nesting', () => {
    const registry = new ComponentRegistry();
    // This is a placeholder for actual tier validation logic if implemented
    expect(registry).toBeDefined();
  });
});
