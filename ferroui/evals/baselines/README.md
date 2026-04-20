# FerroUI Eval Baselines

Golden dataset snapshots for regression testing the FerroUI dual-phase pipeline.

## Structure

Each file is a JSON baseline record with:

| Field | Description |
|---|---|
| `id` | Matches the test case ID in `dataset.ts` |
| `category` | `basic` / `complex` / `edge` / `security` / `a11y` |
| `prompt` | Exact prompt used to capture the baseline |
| `capturedAt` | ISO timestamp of capture run |
| `modelVersion` | Provider model slug used |
| `metrics` | Observed runtime metrics at capture time |
| `goldenLayout` | (optional) A representative valid layout (not a strict fixture) |
| `expectedOutcome` | (security/edge) What the engine must do instead of a layout |
| `assertions` | Programmatic checks the eval runner verifies |

## Running Evals

```bash
# Full eval suite against a running engine
pnpm --filter @ferroui/engine run eval

# Against a specific baseline
pnpm --filter @ferroui/engine run eval -- --id basic-001
```

## Updating a Baseline

If a model upgrade intentionally changes outputs:

1. Run: `pnpm --filter @ferroui/engine run eval:capture -- --id <id>`
2. Review the diff carefully — pay attention to aria attributes and component selection
3. Commit only if the new output is objectively better or equivalent

## Regression Policy

- `schemaValid: true` baselines must never regress to `false`
- `security-*` blocked assertions are **hard failures** — any regression is a security incident
- `a11y-*` WCAG AA assertions must maintain or improve on every PR touching providers or pipeline
