import assert from 'node:assert/strict'
import test from 'node:test'
import { signRecovery, readRecovery, tokenHash, matchesToken, validCredentials, validateCartItems, cartSubtotal } from '../server/cart-core.js'
import { cartLifecycle } from '../src/lib/cartLifecycle.ts'

const id = '12345678-1234-1234-1234-123456789abc'
const secret = 'test-signing-key-not-a-real-credential'
const email = 'fixture@example.test'
const now = Date.UTC(2026, 8, 9)
const item = { id: 'fixture', name: '100 stickers', price: 80.6, quantity: 2, addOns: [{name: 'Design help', price: 25}] }

test('recovery token authenticates the cart, destination and expiry', () => {
  const token = signRecovery(id, email, secret, now)
  const link = readRecovery(token, secret, now + 1000)
  assert.equal(link.id, id)
  assert.equal(link.emailHash, tokenHash(email))
  assert.notEqual(link.emailHash, tokenHash('changed@example.test'))
  assert.throws(() => readRecovery(token, 'wrong-key', now), /Invalid/)
  assert.throws(() => readRecovery(token + 'forged', secret, now), /Invalid/)
  assert.throws(() => readRecovery(token, secret, now + 7 * 86400000), /expired/)
  for (const malformed of ['', 'abc', 'a.b.c', '.x', 'x.']) assert.throws(() => readRecovery(malformed, secret, now))
})

test('cart ownership requires both a valid identifier and the secret', () => {
  const token = 'a'.repeat(64)
  assert.ok(validCredentials({ id, token }))
  assert.ok(matchesToken(token, tokenHash(token)))
  assert.equal(matchesToken('b'.repeat(64), tokenHash(token)), false)
  assert.equal(matchesToken(token, null), false)
  assert.equal(validCredentials({ id, token: 'short' }), false)
})

test('saved subtotal counts add-ons once per batch and rejects malformed money', () => {
  assert.equal(cartSubtotal(validateCartItems([item])), 211.2)
  for (const patch of [{price: -1}, {quantity: 1.5}, {quantity: 0}, {price: Infinity}, {addOns: [{name: 'bad', price: -3}]}]) {
    assert.throws(() => validateCartItems([{ ...item, ...patch }]), /Invalid/)
  }
  assert.deepEqual(validateCartItems([]), [])
})

test('cart lifecycle excludes test, legacy, empty and paid records from inactive carts', () => {
  const base = { items: [item], access_token_hash: 'hash', updated_at: new Date(now).toISOString() }
  assert.equal(cartLifecycle(base, now), 'Active')
  assert.equal(cartLifecycle(base, now + 3600000), 'Inactive')
  assert.equal(cartLifecycle({...base, checkout_started_at: base.updated_at}, now), 'Checkout started')
  assert.equal(cartLifecycle({...base, items: []}, now + 3600000), 'Empty')
  assert.equal(cartLifecycle({...base, access_token_hash: null}, now + 3600000), 'Legacy (unverified)')
  assert.equal(cartLifecycle({...base, converted: true}, now), 'Legacy conversion (unverified)')
  assert.equal(cartLifecycle({...base, paid_order_id: 'paypal:test', recovered_at: base.updated_at}, now), 'Paid')
  assert.equal(cartLifecycle({...base, recovered_at: base.updated_at}, now), 'Restored')
  assert.equal(cartLifecycle({...base, payment_issue_at: base.updated_at}, now), 'Payment issue')
  assert.equal(cartLifecycle({...base, expires_at: new Date(now - 1).toISOString()}, now), 'Expired')
  assert.equal(cartLifecycle({...base, is_test: true, paid_order_id: 'square:test'}, now), 'Test')
})
