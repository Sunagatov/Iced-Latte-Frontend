import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const legacyImportPatterns = [
  {
    group: ['@/shared/components/**'],
    message:
      'Use @/shared/ui, @/app/layout, or feature-owned components instead of the old shared/components paths.',
  },
  {
    group: ['@/shared/providers/**'],
    message: 'Use @/app/providers or feature-owned route guards instead.',
  },
  {
    group: [
      '@/shared/utils/authToken',
      '@/shared/utils/cookieUtils',
      '@/shared/utils/sessionUtils',
    ],
    message: 'Use the dedicated @/shared/auth/* modules instead.',
  },
]

const sharedBoundaryPatterns = [
  {
    group: ['@/app', '@/app/*', '@/app/**'],
    message: 'Shared modules must not depend on app-layer modules.',
  },
  {
    group: ['@/features', '@/features/*', '@/features/**'],
    message: 'Shared modules must not depend on feature-layer modules.',
  },
]

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'indent': ['error', 2],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'semi': ['error', 'never'],
      'func-style': 'off',
      'max-len': 'off',
      'no-magic-numbers': 'off',
      'max-lines-per-function': 'off',
      'space-before-function-paren': [
        'error',
        { anonymous: 'never', named: 'never', asyncArrow: 'always' },
      ],
      'function-call-argument-newline': 'off',
      'padded-blocks': 'off',
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
      'quote-props': 'off',
      'no-restricted-imports': ['error', { patterns: legacyImportPatterns }],

      // Disable new strict React compiler-style rules for this project.
      // They currently force large refactors across working code.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/refs': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [...legacyImportPatterns, ...sharedBoundaryPatterns] },
      ],
    },
  },

  {
    files: [
      '__tests__/**/*.{js,jsx,ts,tsx}',
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
    ],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },

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

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
    'node_modules/**',
    'jest.config.js',
    'jest.setup.js',
    'lint-staged.config.js',
  ]),
])
