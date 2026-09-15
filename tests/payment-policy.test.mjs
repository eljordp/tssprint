import test from 'node:test'
import assert from 'node:assert/strict'
import paypalCreate from '../api/paypal/create-order.js'
import squareCreate from '../server/square-handlers/create-payment.js'
import squareConfig from '../server/square-handlers/checkout-config.js'
import quickbooks from '../api/quickbooks/[action].js'
const response = () => ({ headers: {}, setHeader(k,v) { this.headers[k]=v }, end(value) { this.body=JSON.parse(value) } })
test('QuickBooks-only launch blocks new untaxed charges at the server and retains its policy during outages', async () => {
  const previous = process.env.QUICKBOOKS_CHECKOUT_ENABLED
  process.env.QUICKBOOKS_CHECKOUT_ENABLED='true'
  try {
    for (const handler of [paypalCreate,squareCreate]) { const res=response(); await handler({method:'POST'},res); assert.equal(res.statusCode,409); assert.match(res.body.error,/sales tax/) }
    const sq=response(); await squareConfig({method:'GET'},sq); assert.equal(sq.body.available,false)
    const qb=response(); await quickbooks({method:'GET',url:'/api/quickbooks/checkout-config',headers:{}},qb)
    assert.equal(qb.statusCode,200); assert.equal(qb.body.quickBooksOnly,true); assert.equal(qb.body.enabled,false)
  } finally { if (previous===undefined) delete process.env.QUICKBOOKS_CHECKOUT_ENABLED; else process.env.QUICKBOOKS_CHECKOUT_ENABLED=previous }
})
