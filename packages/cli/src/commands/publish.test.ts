import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { publishCommand } from './publish.js';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('node:fs');

describe('publishCommand', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogMock: Mock;
  let fetchMock: Mock;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should throw an error if component path does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await expect(publishCommand('/fake/path', { dryRun: false })).rejects.toThrow(
      'Component path does not exist: /fake/path'
    );
  });

  it('should perform a dry run if dryRun option is true', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      name: 'Button',
      version: '1.0.0',
      schema: { type: 'object' },
      examples: [{ name: 'Default' }]
    }));

    await publishCommand('/fake/path', { dryRun: true });

    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('📦 Publishing Button@1.0.0...'));
    expect(consoleLogMock).toHaveBeenCalledWith('🔍 Dry run - validation only:');
    expect(consoleLogMock).toHaveBeenCalledWith(expect.stringContaining('"name": "Button"'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should throw an error if no token is provided', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      name: 'Button',
      version: '1.0.0',
      schema: { type: 'object' }
    }));
    delete process.env.FERROUI_REGISTRY_TOKEN;

    await expect(publishCommand('/fake/path', { dryRun: false })).rejects.toThrow(
      'Registry token required. Set FERROUI_REGISTRY_TOKEN env var.'
    );
  });

  it('should publish successfully to the default registry', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      name: 'Button',
      version: '1.0.0',
      schema: { type: 'object' }
    }));
    process.env.FERROUI_REGISTRY_TOKEN = 'fake-token';

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://registry.ferroui.dev/components/Button', id: '123' })
    });

    await publishCommand('/fake/path', { dryRun: false });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://registry.ferroui.dev/api/v1/components',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token',
        },
        body: JSON.stringify({
          name: 'Button',
          version: '1.0.0',
          schema: { type: 'object' }
        })
      })
    );

    expect(consoleLogMock).toHaveBeenCalledWith('✅ Published successfully!');
    expect(consoleLogMock).toHaveBeenCalledWith('   URL: https://registry.ferroui.dev/components/Button');
    expect(consoleLogMock).toHaveBeenCalledWith('   ID: 123');
  });

  it('should publish successfully to a custom registry', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      name: 'Button',
      version: '1.0.0',
      schema: { type: 'object' }
    }));

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://custom.registry/components/Button', id: '456' })
    });

    await publishCommand('/fake/path', { dryRun: false, registry: 'https://custom.registry', token: 'custom-token' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://custom.registry/api/v1/components',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer custom-token',
        }),
      })
    );
  });

  it('should throw an error if the publish fetch request fails', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      name: 'Button',
      version: '1.0.0',
      schema: { type: 'object' }
    }));
    process.env.FERROUI_REGISTRY_TOKEN = 'fake-token';

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    await expect(publishCommand('/fake/path', { dryRun: false })).rejects.toThrow(
      'Publish failed: 500 Internal Server Error'
    );
  });
});
