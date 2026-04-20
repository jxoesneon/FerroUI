import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { PromptLoader } from './loader.js';

describe('PromptLoader', () => {
  let tmpDir: string;
  let promptVersion: string;

  beforeAll(async () => {
    // Create a temporary prompt tree mirroring packages/engine/prompts/v<version>
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ferroui-prompt-test-'));
    promptVersion = 'test-0.0';
    const versionDir = path.join(tmpDir, 'prompts', `v${promptVersion}`);
    await fs.mkdir(versionDir, { recursive: true });
    await fs.writeFile(
      path.join(versionDir, 'Greeting.md'),
      'Hello, {{name}}! Welcome to {{product}}.',
      'utf-8',
    );
    await fs.writeFile(
      path.join(versionDir, 'Empty.md'),
      'No placeholders here.',
      'utf-8',
    );
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  // Helper that constructs a loader pointed at our tmp tree by overriding baseDir.
  function makeLoader(version: string): PromptLoader {
    const loader = new PromptLoader(version);
    // @ts-expect-error — deliberately overriding private baseDir for the test sandbox.
    loader.baseDir = path.join(tmpDir, 'prompts', `v${version}`);
    return loader;
  }

  it('uses FERROUI_PROMPT_VERSION when constructed with no argument', () => {
    const prev = process.env.FERROUI_PROMPT_VERSION;
    process.env.FERROUI_PROMPT_VERSION = '9.9';
    try {
      const loader = new PromptLoader();
      // @ts-expect-error — private field read for assertion.
      expect(loader.baseDir).toMatch(/v9\.9$/);
    } finally {
      if (prev !== undefined) process.env.FERROUI_PROMPT_VERSION = prev;
      else delete process.env.FERROUI_PROMPT_VERSION;
    }
  });

  it('defaults to v1.0 when no env var and no argument', () => {
    const prev = process.env.FERROUI_PROMPT_VERSION;
    delete process.env.FERROUI_PROMPT_VERSION;
    try {
      const loader = new PromptLoader();
      // @ts-expect-error — private field read for assertion.
      expect(loader.baseDir).toMatch(/v1\.0$/);
    } finally {
      if (prev !== undefined) process.env.FERROUI_PROMPT_VERSION = prev;
    }
  });

  it('loads a prompt and replaces all placeholders', async () => {
    const loader = makeLoader(promptVersion);
    const rendered = await loader.loadPrompt('Greeting', {
      name: 'Ada',
      product: 'FerroUI',
    });
    expect(rendered).toBe('Hello, Ada! Welcome to FerroUI.');
  });

  it('leaves unreferenced text alone when variables map is empty', async () => {
    const loader = makeLoader(promptVersion);
    const rendered = await loader.loadPrompt('Empty', {});
    expect(rendered).toBe('No placeholders here.');
  });

  it('leaves an unknown placeholder untouched', async () => {
    const loader = makeLoader(promptVersion);
    const rendered = await loader.loadPrompt('Greeting', { name: 'Ada' });
    expect(rendered).toBe('Hello, Ada! Welcome to {{product}}.');
  });

  it('throws a wrapped error when the prompt file is missing', async () => {
    const loader = makeLoader(promptVersion);
    await expect(loader.loadPrompt('does-not-exist', {})).rejects.toThrow(
      /Failed to load prompt "does-not-exist"/,
    );
  });
});
