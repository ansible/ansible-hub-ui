import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import pluginLingui from 'eslint-plugin-lingui';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import {
  config,
  parser,
  configs as tsConfigs,
  plugin as tsPlugin,
} from 'typescript-eslint';

// require('eslint-plugin-react/configs/recommended') does the right thing but can't be imported
// and the .configs.recommended export adds flatconfig-invalid .plugins and .parserOptions .. remove
const reactConfig = {
  ...reactPlugin.configs.recommended,
  plugins: { react: reactPlugin }, // fix for plugins: ['react']
};
delete reactConfig.parserOptions;

export default config(
  eslint.configs.recommended,
  reactConfig,
  ...tsConfigs.recommended,
  ...tsConfigs.stylistic,
  prettierConfig,
  pluginLingui.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      curly: ['error', 'all'],
      'eol-last': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
      'lingui/no-expression-in-message': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              importNames: [
                'Alert',
                'Breadcrumb',
                'Chip',
                'ChipGroup',
                'ClipboardCopy',
                'ClipboardCopyButton',
                'FileUpload',
                'Icon',
                'LabelGroup',
                'LoginForm',
                'NavList',
                'Pagination',
                'Popover',
                'SearchInput',
                'Spinner',
                'Tooltip',
              ],
              message: 'Import from src/components instead.',
              name: '@patternfly/react-core',
            },
            {
              importNames: ['CodeEditor'],
              message: 'Import from src/components instead.',
              name: '@patternfly/react-code-editor',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['config/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['src/components/patternfly-wrappers/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['test/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        Cypress: 'readonly',
        after: 'readonly',
        before: 'readonly',
        beforeEach: 'readonly',
        cy: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
);
