import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import QuickBooksPayment from '../src/components/QuickBooksPayment'
import '../src/index.css'

// Use Apple's actual web component so its shadow-DOM click behavior is tested.
await customElements.whenDefined('apple-pay-button')

// Local UI fixture only: deliberately no external payments, emails or orders.
const invoice = { id: 'fixture', status:'awaiting_payment', invoiceNumber:'TEST', orderId:null, subtotal:100,discount:0,tax:5.5,total:105.5,items:[],email:'test@example.com',customerName:'Test',deliveryMethod:'pickup',invoiceLink:null,issue:null,lastChecked:null,paymentMode:'wallet',chargeStatus:null }
sessionStorage.removeItem('tss_active_payment')
const testRunId = crypto.randomUUID()
window.fetch = async (input, init) => {
  const url = String(input)
  if (url.endsWith('/checkout-config')) return Response.json({enabled:true,direct:true,environment:'sandbox',categories:['Business Cards'],applePay:{enabled:true,clientId:'local-fixture'}})
  if (url.endsWith('/checkout')) return Response.json({...invoice,id:JSON.parse(String(init?.body)).id})
  if (url === 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens') return Response.json({value:'opaque-ui-fixture-token'})
  if (url.endsWith('/wallet-create')) return Response.json({...invoice,walletOrderId:'LOCALORDER1234567'})
  if (url.endsWith('/wallet-capture')) {
    if(new URLSearchParams(location.search).has('pending')) return Response.json({...invoice,chargeStatus:'PENDING',walletCanRetry:false,walletOrderId:'LOCALORDER1234567'})
    return Response.json({...invoice,status:'payment_recorded',orderId:'LOCALORDER1234567',chargeStatus:'COMPLETED'})
  }
  if (url.endsWith('/checkout-status')) return Response.json({...invoice,chargeStatus:'PENDING',walletCanRetry:false})
  if (url.endsWith('/charge')) {
    const body=JSON.parse(String(init?.body))
    if(body.expectedTotal!==105.5 || body.paymentToken!=='opaque-ui-fixture-token' || 'card' in body) throw new Error('Wrong charge contract')
    return Response.json({...invoice,id:body.id,status:'payment_recorded',orderId:'QB-TEST',chargeStatus:'CAPTURED'})
  }
  throw new Error('Unexpected fixture network request')
}
// The fake wallet sheet is visibly labelled and cannot send a real payment.
class LocalSession {
  static STATUS_SUCCESS=1; static STATUS_FAILURE=0; static canMakePayments(){return true}
  onvalidatemerchant: (event: {validationURL:string})=>void=()=>{};
  onpaymentauthorized: (event: {payment:{token:unknown}})=>void=()=>{};
  oncancel: ()=>void=()=>{};
  begin(){ const sheet=document.createElement('dialog');sheet.id='test-wallet';sheet.innerHTML='<h2>LOCAL APPLE PAY TEST · no money</h2><button id="approve-fixture">Approve test payment</button><button id="cancel-fixture">Cancel</button>';document.body.append(sheet);sheet.showModal();document.getElementById('approve-fixture')!.onclick=()=>this.onpaymentauthorized({payment:{token:'local-test-token'}});document.getElementById('cancel-fixture')!.onclick=()=>{sheet.remove();this.oncancel()};this.onvalidatemerchant({validationURL:'https://local.test'}) }
  completeMerchantValidation(){} completePayment(){document.getElementById('test-wallet')?.remove()} abort(){document.getElementById('test-wallet')?.remove()}
}
Object.assign(window,{ApplePaySession:LocalSession,tssPaypalApple:{Applepay:()=>({config:async()=>({isEligible:true,countryCode:'US',merchantCapabilities:['supports3DS'],supportedNetworks:['visa']}),validateMerchant:async()=>({merchantSession:{}}),confirmOrder:async()=>({})})}})
function Preview() {
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0)
  return <main className="mx-auto max-w-lg p-6 space-y-6"><p>LOCAL TEST · no real charges</p><h1 className="text-3xl font-bold">Checkout</h1>{error && <p role="alert">{error}</p>}<button onClick={()=>setRevision(n=>n+1)}>Change cart details (test)</button><QuickBooksPayment checkoutKey={`test-${revision}`} categories={['Business Cards']} disabled={busy} payload={()=>({testRunId,items:[],customerInfo:{email:'test@example.com'}})} onBusy={setBusy} onError={setError}/></main>
}
createRoot(document.getElementById('root')!).render(<MemoryRouter><Routes><Route path="/" element={<Preview/>}/><Route path="/payment-status" element={<h1>Payment status test destination · no real order</h1>}/></Routes></MemoryRouter>)
