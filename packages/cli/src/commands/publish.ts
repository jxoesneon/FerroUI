/**
 * CLI Command: ferroui publish (G.5)
 * Publish components to the FerroUI registry
 */

import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const PublishOptionsSchema = z.object({
  registry: z.string().url().optional(),
  token: z.string().min(1).optional(),
  dryRun: z.boolean().default(false),
});

type PublishOptions = z.infer<typeof PublishOptionsSchema>;

interface ComponentPackage {
  name: string;
  version: string;
  schema: object;
  examples?: object[];
}

export async function publishCommand(
  componentPath: string,
  options: PublishOptions
): Promise<void> {
  const validated = PublishOptionsSchema.parse(options);

  // Validate component exists
  if (!fs.existsSync(componentPath)) {
    throw new Error(`Component path does not exist: ${componentPath}`);
  }

  // Read component definition
  const componentJson = JSON.parse(
    fs.readFileSync(path.join(componentPath, 'component.json'), 'utf-8')
  );

  const packageDef: ComponentPackage = {
    name: componentJson.name,
    version: componentJson.version,
    schema: componentJson.schema,
    examples: componentJson.examples,
  };

  console.log(`📦 Publishing ${packageDef.name}@${packageDef.version}...`);

  if (validated.dryRun) {
    console.log('🔍 Dry run - validation only:');
    console.log(JSON.stringify(packageDef, null, 2));
    return;
  }

  // Upload to registry
  const registry = validated.registry || 'https://registry.ferroui.dev';
  const token = validated.token || process.env.FERROUI_REGISTRY_TOKEN;

  if (!token) {
    throw new Error('Registry token required. Set FERROUI_REGISTRY_TOKEN env var.');
  }

  const response = await fetch(`${registry}/api/v1/components`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(packageDef),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Publish failed: ${response.status} ${error}`);
  }

  const result = await response.json();
  console.log(`✅ Published successfully!`);
  console.log(`   URL: ${result.url}`);
  console.log(`   ID: ${result.id}`);
}
