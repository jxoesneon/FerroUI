import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: 'ferroui-api-mock',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/layout') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            const welcomeChunk = {
              type: 'layout',
              layout: {
                id: 'welcome',
                type: 'Dashboard',
                props: { className: 'p-8' },
                children: [
                  {
                    id: 'title',
                    type: 'Text',
                    props: { text: 'Welcome to FerroUI' }
                  },
                  {
                    id: 'desc',
                    type: 'Text',
                    props: { text: 'AI-generated UI components are ready.' }
                  },
                  {
                    id: 'action',
                    type: 'ActionButton',
                    props: { label: 'Explore Docs', variant: 'primary' }
                  }
                ]
              }
            };
            
            res.write(`data: ${JSON.stringify(welcomeChunk)}\n\n`);
            res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
            res.end();
            return;
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/layout') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const welcomeChunk = {
              type: 'layout',
              layout: {
                id: 'welcome',
                type: 'Dashboard',
                props: { className: 'p-8' },
                children: [
                  { id: 'title', type: 'Text', props: { text: 'Welcome to FerroUI' } },
                  { id: 'desc', type: 'Text', props: { text: 'Prompt ready.' } }
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
