const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier/flat');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['.expo/**', 'dist/**', 'node_modules/**'],
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  eslintConfigPrettier,
]);
