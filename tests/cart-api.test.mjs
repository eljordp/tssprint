import assert from 'node:assert/strict'
import test from 'node:test'
import handler, { markCartPaid } from '../server/cart-api.js'
import { signRecovery, tokenHash } from '../server/cart-core.js'

const credentials = {id:'12345678-1234-1234-1234-123456789abc', token:'a'.repeat(64)}
const item = {id:'sticker-test', name:'Test stickers', price:50, quantity:1}
process.env.SUPABASE_URL = 'https://database.example.test'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture-key'
process.env.CART_RECOVERY_SECRET = 'fixture-signing-secret'
const originalFetch = globalThis.fetch
let row, emails
function reset() { row = null; emails = 0; delete process.env.RESEND_API_KEY; delete process.env.FROM_EMAIL }
globalThis.fetch = async (url, options = {}) => {
  const u = new URL(url)
  if (u.hostname === 'api.resend.com') { emails++; return Response.json({id:'email-fixture'}) }
  assert.equal(u.hostname,'database.example.test', 'Tests never reach a real service')
  if (!options.method || options.method === 'GET') return Response.json(row ? [row] : [])
  const data=JSON.parse(options.body)
  if (options.method === 'POST') row = {...data}
  if (options.method === 'PATCH') row = {...row,...data}
  return new Response(null,{status:204})
}
async function request(action, body, headers={host:'tssprint.com',origin:'https://tssprint.com','x-real-ip':Math.random().toString()}) {
  const res={statusCode:0, data:null, setHeader(){}, status(code){this.statusCode=code; return this}, json(data){this.data=data;return this}}
  await handler({method:'POST', query:{action}, body, headers},res)
  return res
}
test.after(()=>{globalThis.fetch=originalFetch})
test('sync stores the secret hash, exact subtotal and an empty-cart update',async()=>{
  reset()
  assert.equal((await request('sync',{...credentials,items:[item],email:'Fixture@example.test'})).statusCode,200)
  assert.equal(row.access_token_hash,tokenHash(credentials.token)); assert.equal(row.total_price,50)
  assert.equal(row.email,'fixture@example.test'); assert.equal(row.token,undefined); assert.deepEqual(row.attribution,{})
  assert.equal((await request('sync',{...credentials,items:[]})).statusCode,200)
  assert.deepEqual(row.items,[])
})
test('another token cannot update a cart and a paid cart rejects changes',async()=>{
  reset(); await request('sync',{...credentials,items:[item]})
  assert.equal((await request('sync',{...credentials,token:'b'.repeat(64),items:[]})).statusCode,400)
  assert.equal(row.items.length,1)
  row.converted=true
  assert.equal((await request('sync',{...credentials,items:[]})).statusCode,409)
})
test('email-only lookup fails; signed link rejects changed destination and paid carts',async()=>{
  reset(); await request('sync',{...credentials,items:[item],email:'fixture@example.test'})
  assert.equal((await request('restore',{email:row.email})).statusCode,400)
  const token=signRecovery(row.id,row.email,process.env.CART_RECOVERY_SECRET)
  assert.equal((await request('restore',{token})).statusCode,200)
  row.email='changed@example.test'; assert.equal((await request('restore',{token})).statusCode,410)
  row.email='fixture@example.test'; row.converted=true; assert.equal((await request('restore',{token})).statusCode,410)
})
test('email reports unavailable until configured, then records provider acceptance',async()=>{
  reset(); await request('sync',{...credentials,items:[item],email:'fixture@example.test'})
  assert.equal((await request('email',{...credentials,email:row.email})).statusCode,503); assert.equal(emails,0)
  process.env.RESEND_API_KEY='fixture'; process.env.FROM_EMAIL='fixture@example.test'
  assert.equal((await request('email',{...credentials,email:row.email})).statusCode,200)
  assert.equal(row.email_status,'accepted'); assert.equal(emails,1)
})
test('verified payment can link a cart even if debounced sync has not finished',async()=>{
  reset()
  await markCartPaid(credentials,'square','fixture-payment',{items:[item],subtotal:50,customer:{email:'fixture@example.test'}})
  assert.equal(row.paid_order_id,'square:fixture-payment'); assert.equal(row.converted,true)
})
test('cross-origin requests are rejected before accessing storage',async()=>{
  reset()
  const result=await request('sync',{...credentials,items:[item]},{host:'tssprint.com',origin:'https://untrusted.example','sec-fetch-site':'cross-site'})
  assert.equal(result.statusCode,403); assert.equal(row,null)
})

test('expired links and cleared saved carts cannot restore stale items', async () => {
  reset(); await request('sync', {...credentials, items:[item], email:'fixture@example.test'})
  const expired = signRecovery(row.id, row.email, process.env.CART_RECOVERY_SECRET, Date.now() - 8 * 86400000)
  const rejected = await request('restore', {token:expired})
  assert.equal(rejected.statusCode, 400); assert.match(rejected.data.error, /expired/)
  const token = signRecovery(row.id, row.email, process.env.CART_RECOVERY_SECRET)
  row.items = []
  assert.equal((await request('restore', {token})).statusCode, 410)
})
