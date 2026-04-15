import { validateLayout } from './index';
import * as fs from 'fs';

/**
 * CLI Wrapper for FerroUILayout Validation
 * Usage: cat layout.json | node validate.js
 */
export function main() {
  const data = fs.readFileSync(0, 'utf-8');
  
  if (!data || data.trim() === '') {
    console.error('Error: No input data provided.');
    process.exit(1);
  }

  try {
    const layout = JSON.parse(data);
    const result = validateLayout(layout);

    if (result.valid) {
      console.log('✔ FerroUILayout is valid.');
      process.exit(0);
    } else {
      console.error('✖ FerroUILayout validation failed:');
      result.errors?.forEach((err) => {
        console.error(`  - [${err.path}]: ${err.message}${err.rule ? ` (${err.rule})` : ''}`);
      });
      process.exit(1);
    }
  } catch (err: any) {
    console.error(`Error: Failed to parse JSON input: ${err.message}`);
    process.exit(1);
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}
