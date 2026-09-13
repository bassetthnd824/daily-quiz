import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  globalIgnores(['lib/**', 'generated/**', 'node_modules/**']),
])

export default eslintConfig
