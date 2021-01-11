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

    // allow callback
    'node/no-callback-literal': 'off'
  }
}
