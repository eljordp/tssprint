import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { digest } from '../server/quickbooks-core.js'
import { createWalletOrder, captureWalletOrder, recoverWalletPayment } from '../server/paypal-wallet.js'
import { walletOrderPayload } from '../server/paypal-wallet-core.js'
import { prepareCheckout } from '../server/quickbooks-checkout.js'
import { orderEmailPayload } from '../server/quickbooks-delivery.js'
function fixture() {
  const token=crypto.randomBytes(32).toString('base64url'), merchantId='MERCHANT12345', orderId='ORDER1234567890123'
  const row={id:crypto.randomUUID(),token_hash:digest(token),created_at:new Date().toISOString(),payment_mode:'wallet',estimate_id:'30',invoice_id:null,customer_id:'20',status:'awaiting_payment',tax:10,total:110,environment:'production',realm_id:'123',wallet_payment:null,
    checkout:{subtotal:100,discount:0,total:100,description:'Print order',customer:{firstName:'QA',lastName:'Test',email:'qa@example.com',deliveryMethod:'pickup'},items:[{id:'sticker',name:'Stickers',category:'Stickers',option:'100 pcs',size:'2 x 2',price:100,unitPrice:100,quantity:1,addOns:[],artworkIntent:'send_later'}]}}
  const address={Line1:'23673 Connecticut St',City:'Hayward',CountrySubDivisionCode:'CA',PostalCode:'94545'}
  row.invoice_payload={ShipAddr:address,ShipFromAddr:address,Line:[{Amount:100,DetailType:'SalesItemLineDetail',SalesItemLineDetail:{ItemRef:{value:'73'},Qty:1,UnitPrice:100}}]}
  const estimate={...structuredClone(row.invoice_payload),Id:'30',CustomerRef:{value:'20'},CurrencyRef:{value:'USD'},TotalAmt:110,TxnTaxDetail:{TotalTax:10}}
  let remote,creates=0,captures=0,finalizations=0,lostCapture=false,failSave=false
  const db=async(path,options={})=>{
    const data=options.body && JSON.parse(options.body)
    if(path.includes('acquire_quickbooks_checkout_lock')) {if(row.lock_id)return [];row.lock_id=data.p_lock_id;row.lock_expires_at=new Date(Date.now()+180000).toISOString();return [structuredClone(row)]}
    if(path.includes('finalize_wallet_checkout')) {if(failSave)throw new Error('DB unavailable');finalizations++;row.order_id=orderId;row.status='payment_recorded';return orderId}
    const url=new URL(path,'https://db.invalid')
    if(url.searchParams.has('token_hash')&&url.searchParams.get('token_hash')!==`eq.${row.token_hash}`)return []
    if(url.searchParams.has('lock_id')&&url.searchParams.get('lock_id')!==`eq.${row.lock_id}`)return []
    if(options.method==='PATCH')Object.assign(row,data)
    return [structuredClone(row)]
  }
  const pay=async(path,options={})=>{
    if(path==='/v2/checkout/orders'){creates++;assert.ok(row.wallet_payment.startedAt);remote={...walletOrderPayload(row,merchantId),id:orderId,status:'CREATED'};return structuredClone(remote)}
    if(path.endsWith('/capture')) {captures++;assert.ok(row.wallet_payment.captureStartedAt);remote.status='COMPLETED';remote.payment_source={apple_pay:{}};remote.purchase_units[0].payments={captures:[{id:'CAPTURE123456789',status:'COMPLETED',final_capture:true,amount:{currency_code:'USD',value:'110.00'}}]};if(lostCapture)throw new Error('Lost response')}
    return structuredClone(remote)
  }
  const call=async(path)=>{assert.equal(path,'/estimate/30');return {Estimate:structuredClone(estimate)}}
  return {row,estimate,body:{id:row.id,token,expectedTotal:110,orderId},deps:{db,pay,call,merchantId,context:async()=>({environment:'production',realmId:'123'})},approve(){remote.status='APPROVED';remote.payment_source={apple_pay:{}}},loseCapture(){lostCapture=true},failSave(v){failSave=v},get creates(){return creates},get captures(){return captures},get finalizations(){return finalizations},get remote(){return remote}}
}
test('wallet creates one taxed order, captures once and saves once across retries',async()=>{
  const f=fixture();await createWalletOrder(f.body,f.deps);await createWalletOrder(f.body,f.deps);assert.equal(f.creates,1)
  f.approve();const result=await captureWalletOrder(f.body,f.deps);assert.equal(result.orderId,f.body.orderId);assert.equal(result.invoiceLink,null)
  await captureWalletOrder(f.body,f.deps);assert.equal(f.captures,1);assert.equal(f.finalizations,1)
})
test('lost capture response recovers the same completed capture without charging twice',async()=>{
  const f=fixture();await createWalletOrder(f.body,f.deps);f.approve();f.loseCapture()
  const paid=await captureWalletOrder(f.body,f.deps);assert.ok(paid.orderId);await recoverWalletPayment(f.row,f.deps);assert.equal(f.captures,1)
})
test('payment survives order-save failure and recovery only retries finalization',async()=>{
  const f=fixture();await createWalletOrder(f.body,f.deps);f.approve();f.failSave(true)
  await assert.rejects(captureWalletOrder(f.body,f.deps));assert.equal(f.row.wallet_payment.status,'COMPLETED');assert.equal(f.row.order_id,undefined)
  f.failSave(false);assert.ok((await recoverWalletPayment(f.row,f.deps)).orderId);assert.equal(f.captures,1);assert.equal(f.finalizations,1)
})
test('wrong owner, payment method, order, changed tax or address cannot charge',async()=>{
  for(const mutate of [f=>f.body.token='x'.repeat(43),f=>f.row.payment_mode='direct',f=>f.body.expectedTotal=1,f=>f.estimate.TotalAmt=111,f=>f.estimate.ShipAddr.PostalCode='10001']){
    const f=fixture();mutate(f);await assert.rejects(createWalletOrder(f.body,f.deps));assert.equal(f.captures,0)
  }
  const f=fixture();await createWalletOrder(f.body,f.deps);f.approve();await assert.rejects(captureWalletOrder({...f.body,orderId:'OTHER1234567890123'},f.deps));assert.equal(f.captures,0)
})
test('unapproved and concurrent attempts never charge, and an ambiguous capture is not replayed',async()=>{
  const f=fixture();await createWalletOrder(f.body,f.deps);await assert.rejects(captureWalletOrder(f.body,f.deps));assert.equal(f.captures,0)
  f.approve();f.row.lock_id='another-request';await assert.rejects(captureWalletOrder(f.body,f.deps));f.row.lock_id=null
  f.row.wallet_payment.captureStartedAt=new Date().toISOString();await captureWalletOrder(f.body,f.deps);assert.equal(f.captures,0)
})
test('Apple Pay receipt does not claim an invoice or completed connector import',()=>{
  const f=fixture();f.row.order_id=f.body.orderId
  const mail=orderEmailPayload(f.row,'customer_email',{FROM_EMAIL:'shop@example.com'})
  assert.match(mail.html,/Apple Pay payment received/);assert.doesNotMatch(mail.html,/Invoice null|recorded in QuickBooks|Now Printing/)
})
test('wallet preparation creates only a non-posting estimate and preserves verified production tax',async()=>{
  let row,estimate;const writes=[];const id=crypto.randomUUID(),token=crypto.randomBytes(32).toString('base64url')
  const base=fixture().row.checkout
  const db=async(path,opts={})=>{
    const body=opts.body&&JSON.parse(opts.body)
    if(path.includes('allow_quickbooks_checkout'))return true
    if(path.includes('acquire_quickbooks_checkout_lock')){row.lock_id=body.p_lock_id;row.lock_expires_at=new Date(Date.now()+180000).toISOString();return [structuredClone(row)]}
    if(opts.method==='POST')row={created_at:new Date().toISOString(),tax:null,total:null,...body}
    if(opts.method==='PATCH')Object.assign(row,body)
    return row?[structuredClone(row)]:[]
  }
  const call=async(path,opts)=>{
    if(opts.method==='POST')writes.push(path)
    if(path==='/preferences')return {Preferences:{CurrencyPrefs:{HomeCurrency:{value:'USD'}},TaxPrefs:{UsingSalesTax:true,PartnerTaxEnabled:true}}}
    if(path==='/query')return {QueryResponse:{Item:[{Id:'73',FullyQualifiedName:'Stickers:Vinyl Stickers',Type:'NonInventory',Active:true,Taxable:true}]}}
    if(path==='/customer')return {Customer:{Id:'20'}}
    if(path==='/estimate'){assert.equal(opts.body.AllowOnlineCreditCardPayment,undefined);assert.equal(opts.body.DueDate,undefined);estimate={...opts.body,Id:'30',TotalAmt:110,TxnTaxDetail:{TotalTax:10}};return {Estimate:estimate}}
    if(path==='/estimate/30')return {Estimate:estimate}
    throw new Error('Forbidden accounting write '+path)
  }
  const result=await prepareCheckout({id,token,checkout:{fixture:true}},'rate',{db,call,normalize:async()=>base,context:async()=>({environment:'production',realmId:'123'}),paymentMode:'wallet'})
  assert.deepEqual(writes,['/customer','/estimate']);assert.equal(result.tax,10);assert.equal(result.total,110);assert.equal(row.invoice_id,undefined)
})

test('an approved non-Apple payment is rejected before capture',async()=>{
  const f=fixture();await createWalletOrder(f.body,f.deps);f.approve();f.remote.payment_source={paypal:{}}
  await assert.rejects(captureWalletOrder(f.body,f.deps));assert.equal(f.captures,0)
})

test('owner verification cannot create or capture a wallet above the one-dollar cap',async()=>{
 const f=fixture();f.row.checkout.ownerTest=true;
 await assert.rejects(createWalletOrder(f.body,f.deps),/owner_test_total_mismatch/);
 await assert.rejects(captureWalletOrder(f.body,f.deps),/owner_test_total_mismatch/);
 assert.equal(f.creates,0);assert.equal(f.captures,0);
})
