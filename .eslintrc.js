module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'standard',
    'plugin:vue/recommended'
  ],
  globals: {
    __static: true
  },
  plugins: [
    'vue'
  ],
  rules: {
    // disallow unused expressions
    'no-unused-expressions': 'error',

    // allow paren-less arrow functions
    'arrow-parens': 'off',

    // allow debugger only during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // allow custom callbacks
    'node/no-callback-literal': 'off',

    // enforce (some of the) js rules in vue templates
    'vue/array-bracket-spacing': ['error', 'never'],
    'vue/arrow-spacing': ['error', { before: true, after: true }],
    'vue/comma-dangle': ['error', {
      arrays: 'never',
      objects: 'never',
      imports: 'never',
      exports: 'never',
      functions: 'never'
    }],
    'vue/dot-notation': ['error', { allowKeywords: true }],
    'vue/eqeqeq': 'error',
    'vue/no-irregular-whitespace': 'error',
    'vue/no-empty-pattern': 'error',
    'vue/object-curly-spacing': ['error', 'always'],

    // enforce vue component names
    'vue/match-component-file-name': ['error', {
      extensions: ['vue'],
      shouldMatchCase: true
    }],
    'vue/component-name-in-template-casing': ['error', 'PascalCase', {
      registeredComponentsOnly: false
    }]
  }
}
