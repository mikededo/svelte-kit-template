// @ts-check
import path from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import eslintPluginSvelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteEslintParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  resolvePluginsRelativeTo: dirname,
  baseDirectory: dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all
});

export default tseslint.config(
  eslint.configs.recommended,
  ...compat.plugins('import'),
  ...compat.extends('prettier'),
  ...eslintPluginSvelte.configs['flat/recommended'].map(({ rules, ...rest }) => ({
    // Workaround since svelte-eslint's typings are mismatched with ts-eslint's
    rules: {
      ...rules
    },
    ...rest
  })),
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^(_|\\$\\$Props)',
          varsIgnorePattern: '^(_|\\$\\$Props)',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'import/extensions': ['error', 'ignorePackages', { '': 'never', tsx: 'never', ts: 'never' }],
      'import/export': 2,
      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object'],
          pathGroups: [{ pattern: '\\$*/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' }
        }
      ],
      'import/no-duplicates': ['error', { considerQueryString: true }],
      'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'no-unused-vars': 'off',
      'sort-imports': ['error', { ignoreDeclarationSort: true }]
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        svelteFeatures: {
          // Whether to parse the `generics` attribute.
          // See https://github.com/sveltejs/rfcs/pull/38
          experimentalGenerics: true
        }
      }
    },
    rules: {
      // FIXME: Temporary fix to be able to use $t
      // https://github.com/sveltejs/eslint-plugin-svelte/issues/652
      'svelte/valid-compile': 'off'
    }
  },
  {
    ignores: [
      '!.env.example',
      '.DS_Store',
      '.env.*',
      '.git',
      '.svelte-kit',
      '.vercel',
      './src/app.html',
      'build',
      'node_modules',
      'package',
      'postcss.config.js',
      'tsconfig.tsbuildinfo'
    ]
  }
);
