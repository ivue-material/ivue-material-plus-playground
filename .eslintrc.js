module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    "plugin:vue/base",
    '@vue/typescript/recommended'
  ],
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  rules: {
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "vue/jsx-uses-vars": 2,
    "@typescript-eslint/no-explicit-any": ["off"],
    "vue/no-use-v-if-with-v-for": ["error", {
      "allowUsingIterationVar": false
    }],
    "vue/no-side-effects-in-computed-properties": ["off"],
    "@typescript-eslint/no-empty-function": 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': ['off', {
      'ts-ignore': false
    }],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'vue/comment-directive': ["off"]
  },
}
