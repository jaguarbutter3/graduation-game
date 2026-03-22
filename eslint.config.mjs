import js from '@eslint/js';
import globals from 'globals';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';

export default [
  {
    ignores: ['node_modules/**', 'dist/**'],
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        Phaser: 'readonly',
      },
    },
  },

  {
    files: ['**/*.json'],
    plugins: {
      json: /** @type {any} */ (json),
    },
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },

  {
    files: ['**/*.md'],
    plugins: {
      markdown: /** @type {any} */ (markdown),
    },
    language: 'markdown/gfm',
    rules: {
      'markdown/no-invalid-label-refs': 'error',
    },
  },

  {
    files: ['**/*.css'],
    plugins: {
      css: /** @type {any} */ (css),
    },
    language: 'css/css',
    rules: {
      'css/no-duplicate-imports': 'error',
    },
  },
];
