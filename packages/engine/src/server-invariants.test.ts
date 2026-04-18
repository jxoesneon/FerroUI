import { describe, it, expect } from 'vitest';
import { assertProductionInvariants } from './server';

describe('assertProductionInvariants', () => {
  it('is a no-op when NODE_ENV is not production', () => {
    // Even with unsafe values, non-production environments are permitted.
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'development',
        SKIP_AUTH: 'true',
        JWT_SECRET: 'x',
      }),
    ).not.toThrow();
  });

  it('is a no-op when NODE_ENV is test', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'test',
        SKIP_AUTH: 'true',
      }),
    ).not.toThrow();
  });

  it('throws in production when SKIP_AUTH is "true"', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'production',
        SKIP_AUTH: 'true',
        JWT_SECRET: 'this-is-a-32-char-secret-padding-000',
      }),
    ).toThrow(/SKIP_AUTH is enabled/);
  });

  it('throws in production when SKIP_AUTH is "1"', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'production',
        SKIP_AUTH: '1',
        JWT_SECRET: 'this-is-a-32-char-secret-padding-000',
      }),
    ).toThrow(/SKIP_AUTH is enabled/);
  });

  it('throws in production when JWT_SECRET is missing', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'production',
      }),
    ).toThrow(/JWT_SECRET must be set/);
  });

  it('throws in production when JWT_SECRET is too short', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'production',
        JWT_SECRET: 'too-short',
      }),
    ).toThrow(/JWT_SECRET must be set/);
  });

  it('accepts a well-formed production configuration', () => {
    expect(() =>
      assertProductionInvariants({
        NODE_ENV: 'production',
        JWT_SECRET: 'this-is-a-32-char-secret-padding-000',
      }),
    ).not.toThrow();
  });

  it('aggregates multiple violations into a single error', () => {
    try {
      assertProductionInvariants({
        NODE_ENV: 'production',
        SKIP_AUTH: 'true',
        // missing JWT_SECRET
      });
      expect.fail('should have thrown');
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).toContain('SKIP_AUTH');
      expect(msg).toContain('JWT_SECRET');
    }
  });
});
