const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      globals: { JSX: 'readonly' }
    },
    plugins: { react: reactPlugin },
    rules: {
      'react/react-in-jsx-scope': 'off'
    },
    settings: { react: { version: 'detect' } }
  }
];