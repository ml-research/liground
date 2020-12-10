module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'standard',
    'plugin:vue/essential'
  ],
  globals: {
    __static: true
  },
  plugins: [
    'vue'
  ],
  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    // allow debugger only during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
