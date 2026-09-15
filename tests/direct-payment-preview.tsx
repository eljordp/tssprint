import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import QuickBooksPayment from '../src/components/QuickBooksPayment'
import '../src/index.css'

// Local UI fixture only: deliberately no external payments, emails or orders.
const invoice = { id: 'fixture', status:'awaiting_payment', invoiceNumber:'TEST', orderId:null, subtotal:100,discount:0,tax:5.5,total:105.5,items:[],email:'test@example.com',customerName:'Test',deliveryMethod:'pickup',invoiceLink:null,issue:null,lastChecked:null,paymentMode:'direct',chargeStatus:null }
const testRunId = crypto.randomUUID()
window.fetch = async (input, init) => {
  const url = String(input)
  if (url.endsWith('/checkout-config')) return Response.json({enabled:true,direct:true,environment:'sandbox',categories:['Business Cards']})
  if (url.endsWith('/checkout')) return Response.json({...invoice,id:JSON.parse(String(init?.body)).id})
  if (url === 'https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens') return Response.json({value:'opaque-ui-fixture-token'})
  if (url.endsWith('/charge')) {
    const body=JSON.parse(String(init?.body))
    if(body.expectedTotal!==105.5 || body.paymentToken!=='opaque-ui-fixture-token' || 'card' in body) throw new Error('Wrong charge contract')
    return Response.json({...invoice,id:body.id,status:'payment_recorded',orderId:'QB-TEST',chargeStatus:'CAPTURED'})
  }
  throw new Error('Unexpected fixture network request')
}
function Preview() {
  const [busy,setBusy]=useState(false),[error,setError]=useState('')
  return <main className="mx-auto max-w-lg p-6 space-y-6"><p>LOCAL TEST · no real charges</p><h1 className="text-3xl font-bold">Checkout</h1>{error && <p role="alert">{error}</p>}<QuickBooksPayment checkoutKey="test" categories={['Business Cards']} disabled={busy} payload={()=>({testRunId,items:[],customerInfo:{email:'test@example.com'}})} onBusy={setBusy} onError={setError}/></main>
}
createRoot(document.getElementById('root')!).render(<MemoryRouter><Routes><Route path="/" element={<Preview/>}/><Route path="/payment-status" element={<h1>Payment received · order QB-TEST</h1>}/></Routes></MemoryRouter>)
