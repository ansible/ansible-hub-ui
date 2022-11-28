const globals = require('globals');
const react = require('eslint-plugin-react');
//const reactRecommended = require('eslint-plugin-react/configs/recommended');
const ts = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // .eslintrc extends
  'eslint:recommended',
  //reactRecommended,
  // require('@typescript-eslint/eslint-plugin/dist/configs/eslint-recommended'), // TODO Unexpected key "overrides" found.
  require('eslint-config-prettier'),

  // .eslintrc
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      ts,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        // more overrides below for tests
        APPLICATION_NAME: "readonly",
        NAMESPACE_TERM: "readonly",
      },
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        "ecmaFeatures": {
          "jsx": true,
        },
      },
    },
    settings: {
      "react": {
        "version": "detect",
      },
    },
    rules: {
      "curly": ["error", "all"],
      "eol-last": ["error", "always"],
//TODO      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

      /// FIXME: Rules to add from previous config (see #860)
      // array-bracket-spacing camelcase comma-dangle comma-spacing comma-style curly dot-notation eol-last eqeqeq func-names indent key-spacing keyword-spacing linebreak-style max-len new-cap no-bitwise no-caller no-mixed-spaces-and-tabs no-multiple-empty-lines no-trailing-spaces no-undef no-unused-vars no-use-before-define no-var no-with object-curly-spacing object-shorthand one-var padding-line-between-statements quote-props quotes react/jsx-curly-spacing semi space-before-blocks space-in-parens space-infix-ops space-unary-ops vars-on-top wrap-iife yoda
    },
  },

  // config/.eslintrc
  {
    files: ['config/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "ts/no-var-requires": "off",
    },
  },

  // test/.eslintrc
  {
    files: ['test/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
    globals: {
      "Cypress": "readonly",
      "after": "readonly",
      "before": "readonly",
      "beforeEach": "readonly",
      "cy": "readonly",
      "describe": "readonly",
      "expect": "readonly",
      "it": "readonly",
    },},
    rules: {
//TODO      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
