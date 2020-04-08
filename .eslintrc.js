module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  plugins: ['react-hooks'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    '@typescript-eslint/triple-slash-reference': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
  // env: {
  //     browser: true,
  //     es6: true,
  //     webextensions: true,
  //     jest: true
  //   },
}
