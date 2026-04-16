import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'jest.config.js',
      'jest.setup.js',
      'lint-staged.config.js',
      'eslint.config.mjs',
    ],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: './tsconfig.json',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'semi': ['error', 'never'],
      'func-style': 0,
      'max-len': 0,
      'no-magic-numbers': 0,
      'max-lines-per-function': 0,
      'space-before-function-paren': [
        'error',
        { anonymous: 'never', named: 'never', asyncArrow: 'always' },
      ],
      'function-call-argument-newline': 0,
      'padded-blocks': 0,
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'one-var': ['error', 'never'],
      'quote-props': 0,
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-misused-promises': [
        2,
        { checksVoidReturn: { attributes: false } },
      ],
    },
    overrides: [
      {
        files: ['e2e/**'],
        rules: {
          'react-hooks/rules-of-hooks': 'off',
        },
      },
      {
        files: ['**/*.d.ts'],
        rules: {
          '@typescript-eslint/triple-slash-reference': 'off',
        },
      },
    ],
  }),
]
