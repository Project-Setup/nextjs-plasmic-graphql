/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['next', 'prettier', 'plugin:prettier/recommended'],
  ignorePatterns: ['docs'],
};
