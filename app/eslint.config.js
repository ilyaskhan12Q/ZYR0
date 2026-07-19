export default [{
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: { parser: require('@typescript-eslint/parser') },
  plugins: { '@typescript-eslint': require('@typescript-eslint/eslint-plugin') },
  rules: { '@typescript-eslint/no-explicit-any': 'off' },
}];
