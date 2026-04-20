import type { Config } from 'tailwindcss';
import tailwindcssLogical from 'tailwindcss-logical';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/registry/src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    textAlign: false,
  },
  plugins: [tailwindcssLogical],
} satisfies Config;
