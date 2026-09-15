import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/quickbooks/[action].js'

function res() {
  return { headers: {}, statusCode: 0, body: '', setHeader(name, value) { this.headers[name] = value }, end(value = '') { this.body = value } }
}
test('connection settings and mutations require an admin session', async () => {
  for (const action of ['status', 'connect', 'check', 'disconnect']) {
    const output = res()
    await handler({ method: action === 'status' ? 'GET' : 'POST', url: `/api/quickbooks/${action}`, headers: {} }, output)
    assert.equal(output.statusCode, 403)
    assert.equal(output.headers['Cache-Control'], 'no-store')
    assert.ok(!output.body.includes('CLIENT_SECRET'))
  }
})
test('unknown routes and unsafe HTTP methods do not execute connection operations', async () => {
  const unknown = res(); await handler({ method: 'GET', url: '/api/quickbooks/tokens', headers: {} }, unknown)
  assert.equal(unknown.statusCode, 404)
  const mutation = res(); await handler({ method: 'GET', url: '/api/quickbooks/disconnect', headers: {} }, mutation)
  assert.equal(mutation.statusCode, 405); assert.equal(mutation.headers.Allow, 'POST')
})
