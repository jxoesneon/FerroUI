import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'window.VITE_E2E_MOCK': JSON.stringify(true),
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: 'ferroui-api-mock',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/layout')) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const welcomeChunk = {
              type: 'layout',
              layout: {
                id: 'welcome',
                type: 'Section',
                props: { title: 'Welcome to FerroUI' },
                children: [
                  { id: 'desc', type: 'Text', props: { value: 'Prompt ready.' } },
                  { id: 'action', type: 'Button', props: { label: 'Explore Docs' } }
                ]
              }
            };
            
            res.write(`data: ${JSON.stringify(welcomeChunk)}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/layout')) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const welcomeChunk = {
              type: 'layout',
              layout: {
                id: 'welcome',
                type: 'Section',
                props: { title: 'Welcome to FerroUI' },
                children: [
                  { id: 'desc', type: 'Text', props: { value: 'Prompt ready.' } },
                  { id: 'action', type: 'Button', props: { label: 'Explore Docs' } }
                ]
              }
            };
            
            res.write(`data: ${JSON.stringify(welcomeChunk)}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@ferroui/engine': path.resolve(__dirname, '../../packages/engine/src'),
      '@ferroui/registry': path.resolve(__dirname, '../../packages/registry/src'),
      '@ferroui/schema': path.resolve(__dirname, '../../packages/schema/src'),
      '@ferroui/tools': path.resolve(__dirname, '../../packages/tools/src'),
      '@ferroui/telemetry': path.resolve(__dirname, '../../packages/telemetry/src'),
      '@ferroui/i18n': path.resolve(__dirname, '../../packages/i18n/src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
