import test from 'node:test'
import assert from 'node:assert/strict'
import { verifiedCharge, directChargePayload, assertDirectInvoice } from '../server/quickbooks-direct-core.js'

const row = { id:'order-1', payment_mode:'direct', invoice_id:'42', status:'awaiting_payment', total:105.50, tax:5.50 }
test('only a matching captured or settled processor transaction is paid', () => {
  const charge = { id:'TXN1', amount:'105.50', currency:'USD', status:'CAPTURED', card:{number:'sensitive'} }
  assert.deepEqual(verifiedCharge(charge,row), { chargeId:'TXN1', amount:105.50, currency:'USD', status:'CAPTURED', paid:true })
  for (const status of ['AUTHORIZED','DECLINED','CANCELLED','REFUNDED']) assert.equal(verifiedCharge({...charge,status},row).paid,false)
  assert.equal(verifiedCharge({...charge,status:'SETTLED'},row).paid,true)
  for (const override of [{amount:'105.49'}, {amount:null}, {currency:'CAD'}, {id:'../bad'}, {status:'PENDING'}]) assert.throws(()=>verifiedCharge({...charge,...override},row))
  assert.throws(()=>verifiedCharge(charge,{...row,chargeId:'TXN2'}),/charge_mismatch/)
})
test('charge amount and tax are taken from the prepared server order', () => {
  assert.deepEqual(directChargePayload(row,'opaque-test-token'),{ token:'opaque-test-token', currency:'USD', amount:'105.50', capture:true, context:{isEcommerce:true,tax:5.50}, description:'TSS order order-1' })
  for (const override of [{payment_mode:'invoice'},{status:'payment_recorded'},{total:0},{tax:null},{invoice_id:null}]) assert.throws(()=>directChargePayload({...row,...override},'opaque-test-token'),/payment_not_ready/)
})
test('a simultaneously payable or externally paid invoice cannot be directly charged', () => {
  const invoice = {AllowOnlineCreditCardPayment:false,AllowOnlineACHPayment:false,Balance:105.50,LinkedTxn:[]}
  assert.doesNotThrow(()=>assertDirectInvoice(invoice,row))
  for(const override of [{AllowOnlineCreditCardPayment:true},{AllowOnlineACHPayment:true},{AllowOnlineCreditCardPayment:undefined},{Balance:0},{LinkedTxn:[{TxnType:'Payment'}]}]) assert.throws(()=>assertDirectInvoice({...invoice,...override},row),/invoice_payment_conflict/)
})
