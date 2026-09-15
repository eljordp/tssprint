import test from 'node:test'
import assert from 'node:assert/strict'
import { processQuickBooksDelivery } from '../server/quickbooks-delivery.js'
function fixture(kind) {
  const job = { id: 'job-1', checkout_id: 'checkout-1', kind, status: 'pending', attempts: 0, created_at: new Date().toISOString() }
  const row = { status: 'payment_recorded', order_id: 'QB-1', invoice_number: '3275', total: 55, tax: 5, checkout: { ga4: { clientId: '123.456' }, customer: { firstName: 'Test', email: 'qa@example.com', deliveryMethod: 'pickup' }, items: [], subtotal: 50, discount: 0, total: 50 } }
  const db = async (path, options = {}) => {
    if (path.includes('claim_quickbooks_delivery')) { if (['accepted','completed','needs_review'].includes(job.status)) return []; job.attempts++; job.status='processing';job.lease_id=`lease-${job.attempts}`; return [structuredClone(job)] }
    if (path.startsWith('/rest/v1/quickbooks_checkouts')) return [row]
    assert.ok(path.includes(`lease_id=eq.${job.lease_id}`)); Object.assign(job,JSON.parse(options.body));return [job]
  }
  return {job,row,db}
}
test('a lost email-provider response retries the same frozen payload and idempotency key', async () => {
  const f=fixture('customer_email'), delivered=new Map(); let calls=0
  const send=async (_,request) => { calls++; const key=request.headers['Idempotency-Key']; if(delivered.has(key)) assert.equal(request.body,delivered.get(key)); else delivered.set(key,request.body); if(calls===1) throw new Error('lost response'); return {ok:true,json:async()=>({id:'email-1'})} }
  const options={db:f.db,send,env:{RESEND_API_KEY:'test',FROM_EMAIL:'shop@example.com'}}
  await processQuickBooksDelivery(null,options); assert.equal(f.job.status,'retry')
  f.row.checkout.customer.firstName='Changed after the first send'
  await processQuickBooksDelivery(null,options); assert.equal(f.job.status,'accepted');assert.equal(delivered.size,1)
  await processQuickBooksDelivery(null,options);assert.equal(calls,2)
})
test('missing GA4 setup stays queued and can resume without a manual resend', async () => {
  const f=fixture('analytics');f.job.attempts=12
  await processQuickBooksDelivery(null,{db:f.db,env:{},send:()=>assert.fail('no analytics configured')})
  assert.equal(f.job.status,'retry');assert.match(f.job.last_error,/configuration missing/)
  let sent
  await processQuickBooksDelivery(null,{db:f.db,env:{GA4_API_SECRET:'test',VITE_GA4_MEASUREMENT_ID:'G-TEST'},send:async (_,request)=>{sent=JSON.parse(request.body);return {ok:true}}})
  assert.equal(f.job.status,'accepted');assert.equal(sent.events[0].params.transaction_id,'QB-1');assert.equal(sent.events[0].params.value,50);assert.equal(sent.events[0].params.tax,5)
  assert.doesNotMatch(JSON.stringify(sent),/qa@example.com|firstName/)
  assert.equal(sent.events[0].params.debug_mode, undefined)
  assert.equal(sent.events[0].params.traffic_type, undefined)
})
test('an explicitly marked paid verification purchase remains internal in GA4', async () => {
  const f=fixture('analytics'); f.row.checkout.ga4.debugMode=true
  let sent
  await processQuickBooksDelivery(null,{db:f.db,env:{GA4_API_SECRET:'test',VITE_GA4_MEASUREMENT_ID:'G-TEST'},send:async (_,request)=>{sent=JSON.parse(request.body);return {ok:true}}})
  assert.equal(sent.events[0].params.debug_mode,true)
  assert.equal(sent.events[0].params.traffic_type,'internal')
  assert.doesNotMatch(JSON.stringify(sent),/qa@example.com|firstName/)
})
test('an unpaid invoice cannot send a purchase or receipt', async () => {
  for (const kind of ['analytics','customer_email']) {
    const f=fixture(kind); f.row.status='awaiting_payment'; f.row.order_id=null
    await processQuickBooksDelivery(null,{db:f.db,env:{},send:()=>assert.fail('unpaid invoice must not send')})
    assert.equal(f.job.status,'retry')
  }
})
test('expired GA4 events and ambiguous old email sends require review instead of creating misleading duplicates',async()=>{
  for (const kind of ['analytics','customer_email']) { const f=fixture(kind);f.job.created_at=new Date(Date.now()-71*3600000).toISOString();f.job.first_send_at=f.job.created_at;await processQuickBooksDelivery(null,{db:f.db,env:{},send:()=>assert.fail('must not send')});assert.equal(f.job.status,'needs_review') }
})
