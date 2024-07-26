module.exports = {
  env: {
    browser: false,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    require.resolve('eslint-config-airbnb/base'),
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  rules: {
    'no-use-before-define': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        vars: 'all',
        ignoreRestSiblings: false,
      },
    ],
    'no-shadow': 'off',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'block-like',
      },
      {
        blankLine: 'always',
        prev: 'block-like',
        next: '*',
      },
      {
        blankLine: 'always',
        prev: ['const', 'let'],
        next: ['block-like', 'expression']
      },
    ],
    'object-property-newline': 'error',
    'sort-keys': [
      'error',
      'asc',
      {
        caseSensitive: true,
        natural: false,
      },
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectPattern: {
          multiline: true,
        },
        ExportDeclaration: {
          multiline: true,
          minProperties: 3,
        },
      },
    ],
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'padded-blocks': [
      'error',
      {
        classes: 'always',
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        '': 'never',
        js: 'never',
        json: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'off',
    'linebreak-style': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
    'no-console': 'error',
    'no-debugger': 'error',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
      }
    ],
    quotes: ['error', 'single'],
    '@typescript-eslint/no-use-before-define': 'error',
    '@typescript-eslint/no-shadow': 'error',
  },
  settings: {
    'import/extensions': ['.ts', '.json'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.json'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^@?\\w'],

              ['^(lib/core)(/.*|$)'],
              ['^(lib/utils)(/.*|$)'],

              ['^\\u0000'],
            ],
          },
        ],
      },
    },
  ],
};
