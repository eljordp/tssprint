import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { digest, QuickBooksError } from '../server/quickbooks-core.js'
import { chargeCheckout, recoverDirectPayment } from '../server/quickbooks-direct.js'

process.env.QUICKBOOKS_TOKEN_ENCRYPTION_KEY = 'ab'.repeat(32)
function fixture() {
  const token = crypto.randomBytes(32).toString('base64url')
  const line = {DetailType:'SalesItemLineDetail',Amount:100,SalesItemLineDetail:{ItemRef:{value:'1'},Qty:1,UnitPrice:100}}
  const row = { id:crypto.randomUUID(), token_hash:digest(token), payment_mode:'direct', status:'awaiting_payment',
    environment:'sandbox',realm_id:'123',invoice_id:'30',customer_id:'20',total:105.5,tax:5.5,
    checkout:{total:100,subtotal:100,discount:0,items:[],customer:{email:'test@example.com',firstName:'Test',deliveryMethod:'pickup'}},
    invoice_payload:{Line:[line]},direct_payment:null }
  const invoice = {Id:'30',CustomerRef:{value:'20'},CurrencyRef:{value:'USD'},Line:[line],TotalAmt:105.5,TxnTaxDetail:{TotalTax:5.5},Balance:105.5,
    AllowOnlineCreditCardPayment:false,AllowOnlineACHPayment:false,LinkedTxn:[]}
  let payment, charges=0, orders=0, accountingWrites=0, lostCharge=false, lostAccounting=false, chargeStatus='CAPTURED'
  const db = async (path,opts={}) => {
    const data=opts.body && JSON.parse(opts.body)
    if(path.includes('acquire_quickbooks_checkout_lock')) {
      if(row.lock_id) return []
      row.lock_id=data.p_lock_id;row.lock_expires_at=new Date(Date.now()+180000).toISOString();return [structuredClone(row)]
    }
    if(path.includes('finalize_quickbooks_checkout')) { orders++;row.order_id=`QB-${row.id}`;row.status='payment_recorded';return row.order_id }
    const url=new URL(path,'https://db.invalid')
    if(url.searchParams.has('token_hash') && url.searchParams.get('token_hash')!==`eq.${row.token_hash}`) return []
    if(url.searchParams.has('lock_id') && url.searchParams.get('lock_id')!==`eq.${row.lock_id}`) return []
    if(opts.method==='PATCH') Object.assign(row,data)
    return [structuredClone(row)]
  }
  const call=async(path,opts)=>{
    if(path==='/query') return {QueryResponse:{Invoice:[structuredClone(invoice)]}}
    if(path==='/payment/40') return {Payment:structuredClone(payment)}
    if(path==='/payment') {
      accountingWrites++
      assert.equal(opts.body.TxnSource,'IntuitPayment')
      assert.deepEqual(opts.body.CreditCardPayment.CreditChargeInfo,{ProcessPayment:true})
      assert.ok(!JSON.stringify(opts.body).includes('opaque-test-token'))
      payment={Id:'40',...opts.body}
      // Verified sandbox behavior: without the nested flag, QBO silently
      // omits CreditChargeResponse, breaking recovery after a lost response.
      if(!opts.body.CreditCardPayment.CreditChargeInfo?.ProcessPayment) delete payment.CreditCardPayment
      invoice.Balance=0;invoice.LinkedTxn=[{TxnType:'Payment',TxnId:'40'}]
      if(lostAccounting) throw new Error('lost accounting response')
      return {Payment:structuredClone(payment)}
    }
    throw new Error('Unexpected accounting call')
  }
  const pay=async(path,opts)=>{
    if(path==='/charges') { charges++;assert.equal(opts.body.amount,'105.50');assert.ok(row.direct_payment);assert.ok(!JSON.stringify(row).includes('opaque-test-token'));if(lostCharge) throw new Error('lost charge response') }
    return {id:'CHARGE1',currency:'USD',amount:'105.50',status:chargeStatus}
  }
  return {row,invoice,body:{id:row.id,token,paymentToken:'opaque-test-token',expectedTotal:105.5,paymentAttemptId:crypto.randomUUID()},deps:{db,call,pay,context:async()=>({environment:'sandbox',realmId:'123'})},
    get charges(){return charges},get orders(){return orders},get accountingWrites(){return accountingWrites},
    loseCharge(){lostCharge=true},loseAccounting(){lostAccounting=true},decline(){chargeStatus='DECLINED'} }
}
test('captured charge creates one accounting payment and one order across retries',async()=>{
  const f=fixture();const result=await chargeCheckout(f.body,f.deps)
  assert.equal(result.status,'payment_recorded');assert.equal(result.invoiceLink,null)
  assert.equal(f.row.direct_payment.encryptedPayload,null)
  await chargeCheckout(f.body,f.deps)
  assert.equal(f.charges,1);assert.equal(f.orders,1);assert.equal(f.accountingWrites,1)
})
test('a lost charge response never results in another charge submission',async()=>{
  const f=fixture();f.loseCharge()
  await assert.rejects(chargeCheckout(f.body,f.deps))
  await assert.rejects(chargeCheckout(f.body,f.deps),/charge_review_required/)
  assert.equal(f.charges,1);assert.equal(f.orders,0)
})
test('a lost accounting response recovers the matching payment without recharging',async()=>{
  const f=fixture();f.loseAccounting()
  await assert.rejects(chargeCheckout(f.body,f.deps))
  assert.equal(f.row.direct_payment.status,'CAPTURED')
  const result=await recoverDirectPayment(f.row,f.deps)
  assert.ok(result.orderId);assert.equal(f.charges,1);assert.equal(f.accountingWrites,1);assert.equal(f.orders,1)
})
test('declines, changed totals and hosted-payable invoices never produce paid orders',async()=>{
  const declined=fixture();declined.decline()
  assert.equal((await chargeCheckout(declined.body,declined.deps)).chargeStatus,'DECLINED')
  await chargeCheckout(declined.body,declined.deps)
  assert.equal(declined.charges,1);assert.equal(declined.orders,0)
  await chargeCheckout({...declined.body,paymentAttemptId:crypto.randomUUID()},declined.deps)
  assert.equal(declined.charges,2);assert.equal(declined.row.direct_payment.attempts,2)
  for(const mutate of [f=>{f.body.expectedTotal=1},f=>{f.invoice.TotalAmt=110},f=>{f.invoice.AllowOnlineCreditCardPayment=true},f=>{f.invoice.Balance=0}]){
    const f=fixture();mutate(f);await assert.rejects(chargeCheckout(f.body,f.deps));assert.equal(f.charges,0)
  }
})
test('concurrent charge submissions are serialized by the durable checkout lock',async()=>{
  const f=fixture();f.row.lock_id='held-by-another-request'
  await assert.rejects(chargeCheckout(f.body,f.deps),/checkout_busy/)
  assert.equal(f.charges,0)
})
test('invalid-card rejection clears the token and permits a bounded new-card attempt',async()=>{
  const f=fixture(), pay=f.deps.pay
  f.deps.pay=async()=>{throw new QuickBooksError('invalid_card',402)}
  const rejected=await chargeCheckout(f.body,f.deps)
  assert.equal(rejected.chargeStatus,'DECLINED');assert.equal(f.orders,0)
  assert.equal(f.row.direct_payment.encryptedPayload,null)
  f.deps.pay=pay
  const result=await chargeCheckout({...f.body,paymentAttemptId:crypto.randomUUID()},f.deps)
  assert.ok(result.orderId);assert.equal(f.charges,1);assert.equal(f.row.direct_payment.attempts,2)
})
