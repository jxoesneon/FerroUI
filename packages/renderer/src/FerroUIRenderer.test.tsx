import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { FerroUIRenderer } from './FerroUIRenderer.js';
import { registry } from '@ferroui/registry';

// Mock registry
vi.mock('@ferroui/registry', () => ({
  registry: {
    getComponentEntry: vi.fn().mockReturnValue({ component: (props: any) => <div {...props} /> }),
  },
}));

// Mock TextEncoder
global.TextEncoder = class {
  encode(s: string) { return new Uint8Array([...s].map(c => c.charCodeAt(0))); }
} as any;

// Mock atob
global.atob = (s: string) => Buffer.from(s, 'base64').toString('binary');

describe('FerroUIRenderer (C2PA)', () => {
  const mockLayout = {
    schemaVersion: '1.1.0',
    requestId: '123',
    locale: 'en-US',
    layout: { type: 'Box', props: { 'data-testid': 'box' } },
    metadata: {
      signature: 'bW9jay1zaWduYXR1cmU=', // 'mock-signature' in b64
      publicKey: '-----BEGIN PUBLIC KEY-----bW9jay1wdWJsaWMta2V5-----END PUBLIC KEY-----', // 'mock-public-key' in b64
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.crypto
    const mockCrypto = {
      subtle: {
        importKey: vi.fn().mockResolvedValue({}),
        verify: vi.fn().mockResolvedValue(true),
      },
    };
    vi.stubGlobal('crypto', mockCrypto);
    // In jsdom, window.crypto might already exist, so we stub it carefully
    if (typeof window !== 'undefined') {
      vi.stubGlobal('window', { ...window, crypto: mockCrypto });
    } else {
      vi.stubGlobal('window', { crypto: mockCrypto });
    }
  });

  afterEach(() => {
    cleanup();
  });

  it('displays the verified badge when strictProvenance is true and signature is valid', async () => {
    await act(async () => {
      render(<FerroUIRenderer layout={mockLayout as any} strictProvenance />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Provenance Verified')).toBeDefined();
    });
  });

  it('displays the unverified badge when signature is invalid', async () => {
    // @ts-expect-error - mocking global
    crypto.subtle.verify.mockResolvedValue(false);
    
    await act(async () => {
      render(<FerroUIRenderer layout={mockLayout as any} strictProvenance />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Provenance Unverified')).toBeDefined();
    });
  });

  it('does not display the badge when strictProvenance is false', async () => {
    await act(async () => {
      render(<FerroUIRenderer layout={mockLayout as any} strictProvenance={false} />);
    });
    
    expect(screen.queryByText(/Provenance/)).toBeNull();
  });

  it('displays unverified when signature or public key is missing and strictProvenance is true', async () => {
    const layoutNoSig = { ...mockLayout, metadata: {} };
    await act(async () => {
      render(<FerroUIRenderer layout={layoutNoSig as any} strictProvenance />);
    });
    
    expect(screen.getByText('Provenance Unverified')).toBeDefined();
  });
});
