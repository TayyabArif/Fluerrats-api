// eslint-disable-next-line import/no-extraneous-dependencies -- Safe to remove in next config version
const styleRules = require('@fuelrats/eslint-config/core/style')

module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    '@fuelrats/eslint-config',
  ],
  rules: {
    'no-restricted-syntax': styleRules.rules['no-restricted-syntax'].concat([
      'VariableDeclarator LogicalExpression[operator="||"]',
    ]),
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
}

