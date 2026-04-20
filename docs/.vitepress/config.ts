import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { sidebar } from './sidebar';
import { nav } from './nav';

export default withMermaid(
  defineConfig({
    title: 'FerroUI',
    description:
      'The AI-native, server-driven UI meta-framework. Generative UI orchestration, semantic caching, and atomic component registries built for production.',
    lang: 'en-US',
    base: '/FerroUI/',
    srcDir: '.',
    srcExclude: ['**/site/**', '**/.generated/README.md', '**/node_modules/**'],
    cleanUrls: true,
    lastUpdated: true,
    metaChunk: true,

    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/FerroUI/favicon.svg' }],
      ['meta', { name: 'theme-color', content: '#38bdf8' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'FerroUI' }],
      ['meta', { property: 'og:title', content: 'FerroUI — Server-Driven UI Meta-Framework' }],
      ['meta', {
        property: 'og:description',
        content:
          'AI-native, server-driven UI meta-framework with semantic caching and atomic component registries.',
      }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['link', {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      }],
      ['link', {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      }],
      ['link', {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
      }],
    ],

    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark',
      },
      lineNumbers: false,
    },

    themeConfig: {
      logo: '/logo.svg',
      siteTitle: 'FerroUI',

      nav,
      sidebar,

      socialLinks: [
        { icon: 'github', link: 'https://github.com/jxoesneon/FerroUI' },
      ],

      editLink: {
        pattern: 'https://github.com/jxoesneon/FerroUI/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },

      lastUpdated: {
        text: 'Last updated',
        formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
      },

      search: {
        provider: 'local',
        options: {
          detailedView: true,
          miniSearch: {
            searchOptions: {
              fuzzy: 0.2,
              prefix: true,
              boost: { title: 4, text: 2, titles: 1 },
            },
          },
        },
      },

      outline: {
        level: [2, 3],
        label: 'On this page',
      },

      docFooter: {
        prev: 'Previous',
        next: 'Next',
      },

      footer: {
        message:
          'Released under the MIT License. Built with Liquid Mercury standards.',
        copyright: '© 2026 FerroUI Project Team',
      },

      externalLinkIcon: true,
    },

    sitemap: {
      hostname: 'https://jxoesneon.github.io/FerroUI/',
    },

    ignoreDeadLinks: [
      // Allow links to files outside of VitePress routing
      /^https?:\/\/localhost/,
    ],
  }),
);
