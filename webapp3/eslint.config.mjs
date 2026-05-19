import eslintConfigLove from 'eslint-config-love'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  eslintConfigLove,
  eslintConfigPrettier,
  {
    rules: {
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'never']
    }
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
  },
  {
    ignores: ['dist', 'eslint.config.mjs', 'vite.config.ts' ],
  }
]