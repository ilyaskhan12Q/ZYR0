import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [{
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: { parser: tsParser },
  plugins: {
    '@typescript-eslint': tsPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}];



