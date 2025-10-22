import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config([
  {
    ignores: [
      'dist/',
      'node_modules/',
      'src/generated/',
      'src/modules/_example/',
    ],
  },

  // TypeScript config
  {
    files: ['src/**/*.{ts,mts,cts}'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: true,
      },
    },
    rules: {
      // 'no-restricted-imports': [
      //   'warn',
      //   {
      //     patterns: [
      //       {
      //         group: ['../*', './../*', '../../*'],
      //         message:
      //           'Use absolute imports with @ alias instead of relative imports',
      //       },
      //     ],
      //   },
      // ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'warn',
    },
  },
]);
