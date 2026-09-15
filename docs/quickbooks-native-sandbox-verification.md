# Native QuickBooks payment verification — 2026-09-15

## Provider results

The test used Intuit sandbox company `9341457915875518`, a published dummy Visa card, and $1.00 sandbox charges. No production card was submitted, and no production funds moved.

| Check | Observed result |
| --- | --- |
| Tokenized charge | CAPTURED, USD 1.00 (`MT1858380796`; corrected follow-up `MT0909390240`) |
| Identical Request-Id replay | Returned the original charge ID; no new charge |
| Direct invoice | Online card and ACH both false; exact $1.00 unpaid balance |
| Original accounting payload | Invoice 147/payment 148: paid balance zero, but CCTransId was omitted |
| Corrected accounting payload | Invoice 149/payment 150: CCTransId retained, TxnSource=IntuitPayment, nested ProcessPayment=true, payment linked, invoice balance zero |
| `emulate=10201` | HTTP 400, PMT-6000 system_error; outcome stays uncertain and cannot initiate another charge |
| `emulate=10301` | HTTP 400, PMT-4000 invalid_request, detail=card.number; permits bounded replacement-card attempt |
| `emulate=10401` | Charge object with DECLINED status |

## Correction supported by the provider contract

`CreditCardPayment.CreditChargeInfo.ProcessPayment=true` tells Accounting to retain the response from the charge that already happened. The original top-level `ProcessPayment=false` did not accomplish that. The corrected request contains an existing charge reference and no card number, card security code or payment token.

The [Accounting Payment reference](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/payment) documents that the nested flag controls storage of CreditChargeResponse. Intuit's [payment/accounting workflow](https://developer.intuit.com/app/developer/qbpayments/docs/workflows/process-a-payment) describes the accompanying `TxnSource=IntuitPayment` value used for reconciliation. The sandbox retained both settings. Actual production settlement, deposits and fees are still unverified.

Failure inputs came from [Intuit's official mock-data guide](https://developer.intuit.com/app/developer/qbpayments/docs/workflows/test-your-app). Only the specifically verified invalid-card error is converted into a retryable rejection; a generic HTTP 400 is not considered a decline.

## Site verification

- Both database migrations applied. `requested_scopes`, `payment_mode` and `direct_payment` confirmed in the schema.
- RLS enabled on the two private tables; `anon` and `authenticated` have no SELECT privilege.
- Owner completed production Payments consent; live admin displays Payments permission granted.
- 66 QuickBooks tests pass after corrections, including lost accounting-response recovery and invalid-card replacement without duplicate charging. TypeScript and changed-component lint pass.
- Production release `01972fb` / `dpl_39gvNensawvZuv6qYzuc1T3ZZFAw` promoted. Public configuration returns direct=true.
- Live checkout `c5402a44-2f5e-4faa-b9fe-623106181faa`, internal invoice 3279: awaiting_payment, total $181.91, tax $17.66, no charge attempt, no order, no error. Verified card fields and final total stay on tssprint.com at desktop and 390px width. This is an unpaid verification cart.
- Tests of the orchestration use a simulated database. The real sandbox exercise validates provider tokenization, charges, replay and accounting records; it does not prove a production order, email delivery, GA4 purchase or bank settlement.

## Outstanding evidence

One user-approved production payment is still needed to verify the live merchant charge, saved order, receipt delivery and analytics. On-site Apple Pay is not implemented or verified; Apple's browser demo is not evidence of TSS merchant registration or Intuit wallet support.
