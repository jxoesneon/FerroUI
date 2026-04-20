/**
 * FerroUI Prompt Firewall — Security spec §2.1 / OWASP LLM Top 10 LLM01
 *
 * Provider-agnostic integration point for external prompt guard services.
 * Supports three backends, selected via PROMPT_GUARD_PROVIDER env var:
 *
 *   - "lakera"  → Lakera Guard API  (requires LAKERA_GUARD_API_KEY)
 *   - "nemo"    → NVIDIA NeMo Guardrails HTTP endpoint  (requires NEMO_GUARD_ENDPOINT)
 *   - "none"    → Falls through to FerroUI built-in regex detection only (default)
 *
 * The built-in detector always runs regardless of backend, providing defence-in-depth.
 */

export interface FirewallResult {
  blocked: boolean;
  reason?: string;
  score?: number;
  provider: 'builtin' | 'lakera' | 'nemo' | 'none';
}

/** Built-in regex-based injection patterns (always applied) */
const BUILTIN_PATTERNS: RegExp[] = [
  /ignore previous instructions/i,
  /system\s+prompt/i,
  /you are now a/i,
  /instead of your usual/i,
  /new rules/i,
  /\bbypass\b/i,
  /\bjailbreak\b/i,
  /DAN mode/i,
  /output ONLY/i,
  /forget everything/i,
  /pretend you are/i,
  /disregard (all )?previous/i,
  /<\s*\/?(system|instruction|prompt)\s*>/i,
];

function runBuiltinCheck(prompt: string): FirewallResult {
  const hit = BUILTIN_PATTERNS.find(p => p.test(prompt));
  if (hit) {
    return { blocked: true, reason: `Matched built-in injection pattern: ${hit.source}`, provider: 'builtin' };
  }
  return { blocked: false, provider: 'builtin' };
}

async function runLakeraCheck(prompt: string): Promise<FirewallResult> {
  const apiKey = process.env.LAKERA_GUARD_API_KEY;
  if (!apiKey) {
    console.warn('[PromptFirewall] LAKERA_GUARD_API_KEY not set — skipping Lakera check');
    return { blocked: false, provider: 'lakera' };
  }

  try {
    const res = await fetch('https://api.lakera.ai/v2/guard', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      console.warn(`[PromptFirewall] Lakera Guard returned ${res.status} — failing open`);
      return { blocked: false, provider: 'lakera' };
    }

    const data = await res.json() as { results?: Array<{ flagged: boolean; categories?: Record<string, number> }> };
    const result = data.results?.[0];
    const flagged = result?.flagged ?? false;
    const score = result?.categories ? Math.max(...Object.values(result.categories)) : undefined;

    return {
      blocked: flagged,
      reason: flagged ? 'Lakera Guard: prompt injection or policy violation detected' : undefined,
      score,
      provider: 'lakera',
    };
  } catch (err) {
    console.warn('[PromptFirewall] Lakera Guard request failed — failing open:', err instanceof Error ? err.message : err);
    return { blocked: false, provider: 'lakera' };
  }
}

async function runNemoCheck(prompt: string): Promise<FirewallResult> {
  const endpoint = process.env.NEMO_GUARD_ENDPOINT;
  if (!endpoint) {
    console.warn('[PromptFirewall] NEMO_GUARD_ENDPOINT not set — skipping NeMo check');
    return { blocked: false, provider: 'nemo' };
  }

  try {
    const res = await fetch(`${endpoint}/v1/guardrails/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: prompt }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      console.warn(`[PromptFirewall] NeMo Guardrails returned ${res.status} — failing open`);
      return { blocked: false, provider: 'nemo' };
    }

    const data = await res.json() as { blocked?: boolean; reason?: string };
    return {
      blocked: data.blocked ?? false,
      reason: data.reason,
      provider: 'nemo',
    };
  } catch (err) {
    console.warn('[PromptFirewall] NeMo Guardrails request failed — failing open:', err instanceof Error ? err.message : err);
    return { blocked: false, provider: 'nemo' };
  }
}

/**
 * Run the prompt through the configured firewall provider.
 * Built-in patterns always run first; external provider runs second.
 * Fails open on external provider errors to avoid availability loss.
 *
 * @returns FirewallResult — callers must check `blocked` and return early if true.
 */
export async function checkPromptFirewall(prompt: string): Promise<FirewallResult> {
  // Built-in check always runs first (zero latency, zero cost)
  const builtin = runBuiltinCheck(prompt);
  if (builtin.blocked) return builtin;

  const provider = (process.env.PROMPT_GUARD_PROVIDER ?? 'none').toLowerCase();

  switch (provider) {
    case 'lakera':
      return runLakeraCheck(prompt);
    case 'nemo':
      return runNemoCheck(prompt);
    default:
      return { blocked: false, provider: 'none' };
  }
}
