// Regression test for issue #177: 3check positions generated in 960 mode
// must carry the remaining-checks counter ("3+3"), otherwise the engine
// treats the game as 1-check.
const { test } = require('node:test')
const assert = require('node:assert')
const fs = require('fs')
const path = require('path')

// Load the methods of Mode960.vue without a Vue toolchain.
const sfc = fs.readFileSync(path.join(__dirname, '../src/renderer/components/Mode960.vue'), 'utf8')
const script = sfc.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*$/m, '')
  .replace('export default', 'return')
const component = new Function('mapGetters', script)(() => ({}))

test('3check 960 FEN includes the 3+3 check counter', () => {
  const ctx = { ...component.methods, variant: '3check', curVar: '' }
  const fen = ctx.c960_fen(518)
  assert.strictEqual(fen.split(' ')[4], '3+3', `unexpected FEN: ${fen}`)
})

test('chess 960 FEN has no check counter', () => {
  const ctx = { ...component.methods, variant: 'chess', curVar: '' }
  const fen = ctx.c960_fen(518)
  assert.strictEqual(fen.split(' ').length, 6, `unexpected FEN: ${fen}`)
  assert.strictEqual(fen.split(' ')[4], '0')
})
