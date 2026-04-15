// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod';
import { FerroUILayout, validateLayout, ValidationIssue } from '@ferroui/schema';
import { registry } from '@ferroui/registry';
import { LlmProvider } from '../providers/base';
import { LlmRequest, RequestContext } from '../types';

/**
 * Fuzzy matches a component type against the registry
 */
export function fuzzyMatchComponent(type: string): string | undefined {
  const allComponents = registry.getAllComponents().map((c: any) => c.name);
  
  // Basic case-insensitive match
  const exactMatch = allComponents.find((c: string) => c.toLowerCase() === type.toLowerCase());
  if (exactMatch) return exactMatch;

  // Simple edit distance (Levenshtein) or just prefix/contains
  const sortedMatches = allComponents
    .map((c: string) => ({
      name: c,
      score: calculateSimilarity(c.toLowerCase(), type.toLowerCase())
    }))
    .filter((m: any) => m.score > 0.6)
    .sort((a: any, b: any) => b.score - a.score);

  return sortedMatches[0]?.name;
}

function calculateSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Self-healing repair loop
 */
export async function repairLayout(
  provider: LlmProvider,
  originalPrompt: string,
  invalidLayout: any,
  errors: ValidationIssue[],
  context: RequestContext,
  attempt: number = 1,
  maxAttempts: number = 3
): Promise<FerroUILayout> {
  if (attempt > maxAttempts) {
    throw new Error(`Failed to repair layout after ${maxAttempts} attempts.`);
  }

  const errorReport = errors.map((e: ValidationIssue) => `- ${e.path}: ${e.message}`).join('\n');
  
  const repairSystemPrompt = `
# FerroUI UI - Repair Mode

The following layout JSON failed validation. Your task is to fix it.

## ORIGINAL PROMPT
${originalPrompt}

## VALIDATION ERRORS
${errorReport}

## INVALID JSON
${JSON.stringify(invalidLayout, null, 2)}

## INSTRUCTIONS
- Output ONLY the fixed valid JSON
- Do not add explanations
- Fix all validation errors
- Maintain original content intent
- If a component is missing from the registry, use its closest match or render a StatusBanner
`;

  const repairRequest: LlmRequest = {
    systemPrompt: repairSystemPrompt,
    userPrompt: "Please provide the corrected JSON object.",
    temperature: 0.1, // Low temperature for precision
  };

  const response = await provider.completePrompt(repairRequest);
  
  let fixedJson: any;
  try {
    // Attempt to extract JSON from the response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    fixedJson = JSON.parse(jsonMatch ? jsonMatch[0] : response.content);
  } catch {
    // If still not valid JSON, retry repair
    return repairLayout(provider, originalPrompt, response.content, [{
      path: 'root',
      message: 'Output was not valid JSON',
      code: 'json_parse'
    }], context, attempt + 1, maxAttempts);
  }

  // Validate the "fixed" JSON
  const validationResult = validateLayout(fixedJson);
  
  if (!validationResult.valid) {
    return repairLayout(
      provider,
      originalPrompt,
      fixedJson,
      validationResult.errors!,
      context,
      attempt + 1,
      maxAttempts
    );
  }

  return validationResult.data!;
}
