import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/engine',
  'packages/schema',
  'packages/i18n',
  'apps/web',
]);