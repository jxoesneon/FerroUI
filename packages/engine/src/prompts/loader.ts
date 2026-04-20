import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PINNED_VERSION_FILE = path.resolve(__dirname, '../../.prompt-version');

/**
 * PromptLoader dynamically loads versioned markdown system prompts 
 * and handles template variable replacement.
 */
export class PromptLoader {
  private static pinnedVersion: string | null = null;
  private baseDir: string;

  constructor(version?: string) {
    // Attempt to load pinned version from file if not already set in memory
    if (!PromptLoader.pinnedVersion) {
      try {
        if (fsSync.existsSync(PINNED_VERSION_FILE)) {
          PromptLoader.pinnedVersion = fsSync.readFileSync(PINNED_VERSION_FILE, 'utf-8').trim();
        }
      } catch {
        // Silently fail if file cannot be read
      }
    }

    const resolvedVersion = version || PromptLoader.pinnedVersion || process.env.FERROUI_PROMPT_VERSION || '1.0';
    // Points to packages/engine/prompts/v[version]
    // Current file location: packages/engine/src/prompts/loader.ts
    this.baseDir = path.resolve(__dirname, '../../prompts', `v${resolvedVersion}`);
  }

  /**
   * Sets a specific version to be used by all new instances of PromptLoader.
   * This overrides the environment variable but can still be overridden by constructor arguments.
   * 
   * @param version The version string (e.g. "1.1") or null to clear pinning
   */
  static setPinnedVersion(version: string | null): void {
    PromptLoader.pinnedVersion = version;
  }

  /**
   * Loads a prompt by name and replaces placeholders with provided variables.
   * 
   * @param name The name of the prompt file (without .md extension)
   * @param variables A map of variable names to their values to replace in the prompt
   * @returns The processed prompt content
   */
  async loadPrompt(name: string, variables: Record<string, string>): Promise<string> {
    const filePath = path.join(this.baseDir, `${name}.md`);
    let content: string;
    
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      throw new Error(`Failed to load prompt "${name}" from ${filePath}`, { cause: err });
    }

    // Replace all placeholders like {{variableName}}
    for (const [key, value] of Object.entries(variables)) {
      content = content.split(`{{${key}}}`).join(value);
    }

    return content;
  }
}
