import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * PromptLoader dynamically loads versioned markdown system prompts 
 * and handles template variable replacement.
 */
export class PromptLoader {
  private baseDir: string;

  constructor(version: string = process.env.FERROUI_PROMPT_VERSION || '1.0') {
    // Points to packages/engine/prompts/v[version]
    // Current file location: packages/engine/src/prompts/loader.ts
    this.baseDir = path.resolve(__dirname, '../../../prompts', `v${version}`);
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
