import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import React from 'react';

describe('Desktop App', () => {
  it('should render successfully', () => {
    // Basic render test to ensure component is valid
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
