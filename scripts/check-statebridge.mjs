import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const html = fs.readFileSync(new URL('../sites/statebridge/index.html', import.meta.url), 'utf8')
const match = html.match(/<script>([\s\S]*?)<\/script>/i)
assert.ok(match, 'The standalone demo needs an inline JS script')
new vm.Script(match[1], { filename: 'statebridge-inline.js' })
for (const scenario of ['captured','approved','unknown','voided']) {
  assert.ok(html.includes('data-scenario="' + scenario + '"'), 'Missing scenario ' + scenario)
}
for (const action of ['rebuildBtn','repayBtn','verifyBtn','recoverBtn','exportBtn']) {
  assert.ok(html.includes('id="' + action + '"'), 'Missing action ' + action)
}
assert.ok(html.includes('No PayPal API, bank, or live model is contacted'), 'Demo must disclose simulation boundaries')
assert.ok(html.includes('APPROVED ≠ CAPTURED'), 'Status distinction is missing')
assert.ok(html.includes('intent_demo_01'), 'Stable purchase-intent ID must be visible')
console.log('StateBridge preview integrity and JavaScript syntax: PASS')
