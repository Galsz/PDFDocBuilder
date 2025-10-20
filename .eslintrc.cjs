module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 'off',
    'import/order': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'prettier/prettier': 'off',
    'no-param-reassign': 'off',
    'no-use-before-define': 'off',
    'consistent-return': 'off',
    'class-methods-use-this': 'off',
    'global-require': 'off',
    'no-else-return': 'off',
    radix: 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'no-return-await': 'off',
    'default-param-last': 'off',
    'prefer-template': 'off',
    'no-unused-vars': ['warn', { args: 'none', vars: 'all' }],
  },
  overrides: [
    {
      files: ['**/tests/**/*.js'],
      env: {
        mocha: true,
        jest: true,
      },
    },
  ],
};
