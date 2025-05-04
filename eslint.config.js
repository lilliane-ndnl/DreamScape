export default [
  {
    ignores: ['**/node_modules/**', '**/build/**'],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'quotes': ['warn', 'single'],
      'jsx-quotes': ['warn', 'prefer-double'],
      'semi': ['warn', 'always'],
      'indent': ['warn', 2],
      'comma-dangle': ['warn', 'always-multiline'],
      'react/prop-types': 'off',
    },
  },
]; 