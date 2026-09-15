# Direct payments on tssprint.com

Status: on-site card checkout is deployed and enabled on tssprint.com. Real-money charge, receipt delivery, GA4 purchase and bank settlement remain unverified. On-site Apple Pay is deployed and enabled. Its official button, normal pointer activation and Chrome iPhone handoff are verified on the final release. A real phone authorization, capture, receipt, GA4 purchase and connector import remain pending. Updated 2026-09-15.

## Apple Pay setup — September 15 follow-up

- User approved keeping Intuit for cards, adding PayPal for on-site Apple Pay, and recording both in QuickBooks. Do not switch all payments to PayPal or restore the old untaxed PayPal checkout.
- The live PayPal `tssprint` app initially showed Apple Pay not provisioned. Owner completed the merchant activation form and accepted PayPal's card and alternate-payment agreements. The live app now shows Apple Pay enabled.
- Published PayPal's production domain association file at `https://tssprint.com/.well-known/apple-developer-merchantid-domain-association`; exact downloaded bytes verified against the live HTTP 200 response with `application/octet-stream`. Deployment `dpl_DBimYUmKAhkCE5KXv5sDjrfgd2RH`, source `3e19700`, promoted; direct QuickBooks config remains enabled.
- PayPal displayed **Your website is registered with Apple Pay!** after registering `tssprint.com`. No need to register `www` while it redirects customers to the canonical domain and does not display checkout itself.
- Verified the merchant already has **PayPal Connector by QuickBooks**, with automatic posting and product/customer/supplier tracking ON. It remains the only writer of PayPal accounting sales/fees. The website never creates a wallet invoice or a second sales receipt. [Connector documentation](https://quickbooks.intuit.com/learn-support/en-us/help-article/mobile-apps/use-paypal-connector-quickbooks-app/L5eoHQvLj_US_en_US).
- **Production tax mechanism verified:** a non-posting [QuickBooks Estimate](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/estimate), ID **3281**, created 2026-09-15 at 14:21 Pacific for the existing TSS Checkout Verification contact. The $182.50 sticker/Mylar cart, $18.25 AUTO10 discount and real Hayward pickup address returned **$17.66 tax / $181.91 total**, exactly matching invoice 3279. Its note identifies it as a tax test; EmailStatus is NotSet. No invoice, payment or email was sent by this test. Earlier sandbox estimate 151 returned zero tax and was not used as production tax evidence.
- Implemented wallet quote preparation, server-authenticated PayPal create/capture/GET verification, persisted attempt and capture references, durable locking and atomic order/follow-up finalization. Captured amount, tax, itemization, merchant, payment source, order and delivery details must match. A lost capture response is read back, not recharged. Saving a paid order can retry independently of a charge.
- Added the Apple Pay SDK/button beside the card choice, immediate native-sheet opening, cancellation recovery, pending-payment status link, and browser-reload guard against switching to another payment while one is unresolved. Card processing remains Intuit. SDK eligibility and the real TSS merchant sheet still require live verification after release.
- Connected both native payment paths to GA4 shipping/payment steps, with explicit processor/method; purchases remain server-triggered after payment verification, with stable transaction IDs and tax. Customer/staff receipts accurately say payment confirmed; wallet receipts do not claim an invoice or completed connector import. Admin payment verification now requires staff authentication and verifies wallet orders against their saved contract.
- Local verification: **103 tests** across QuickBooks, wallet, analytics and price/promo enforcement; TypeScript/build and changed-component lint. Chrome fixture verified cancel → payment choices restored, successful mock capture → status destination, pending capture → no successful order/recovery action; editing the cart during an uncertain payment → recovery only, no fresh Pay action; 390px layout checked and viewport restored. These are fixture tests, not real wallet charges.
- Google's `/debug/mp/collect` returned HTTP 200 and `validationMessages: []` for the exact purchase-payload builder. Validation does not test the API secret or create a reported purchase; real GA4 receipt remains pending. [Google validation documentation](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events).

### Release gate and next actions

1. Supabase access restored. Migration `20260915220000_paypal_wallet.sql` applied successfully. A transaction rolled back after verifying missing payment evidence is rejected. Anonymous/customer finalizer access false, service access true; checkout/jobs RLS and unique wallet order index true; wallet scheduler dispatch present. Existing QA direct row remained unchanged.
2. Enabled deployment **dpl_FQtkcMHoV2oar4HfpnT7x2GEBqrQ** (source **14b9a14**) promoted. Persisted `PAYPAL_APPLE_PAY_ENABLED=true` in production settings. Both direct cards and wallet config verified live.
3. Real deployed wallet preparation created non-posting Estimate **3282**, checkout **f3a7ea47-6ef8-4b10-bb60-042033256a3e**, tax **$17.66**, total **$181.91**. PayPal created unpaid order **1VM67336PP4125340**, with merchant/amount/items/delivery contract verified by GET. Unapproved capture rejected (`wallet_not_approved`), modified amount rejected (`wallet_payment_mismatch`), wrong ownership rejected (`checkout_not_found`). No capture attempt, paid order or delivery jobs were created.
4. Live Chrome wallet quote also returned $181.91. Keyboard activation opened Apple's **Scan Code with iPhone (iOS 18 or later)** dialog on tssprint.com; cancel restored both methods. Pointer activation revealed Apple's web-component click was not reaching React's delegated handler. Follow-up binds the native click listener directly, sizes the official control to 48px, and uses neutral payment heading copy. The updated fixture waits for Apple's real web component, then replaces payments with a labelled local simulation; real-button pointer click, cancel/retry and simulated approval passed. Build/TypeScript and changed-component ESLint passed. Merchant validation after phone handoff is not yet proven. Latest three scheduled workers completed without errors; no real paid-order delivery jobs exist yet.
- Final release **5c2c1b1**, deployment **dpl_5Gb6dZRawvdmBCQNX7j4mqyR8UQr**, promoted after successful build and enabled config checks. Normal pointer click now opens Apple's iPhone scan dialog on tssprint.com; no captured browser warnings/errors. Official button checked at 390×844; normal viewport restored.
- Final tracked browser checkout **25015bf3-0a88-4234-a0c9-d5f5c454469c**, Estimate **3284**, returned $17.66 tax / $181.91 total and stored valid GA4 client/session IDs with explicit internal debug mode. This makes the test traceable without representing staff activity as ordinary customer traffic. The scan window remains open for user handoff. Scanning/merchant validation on iPhone, payment approval and capture have not been completed.
- Readiness judgment for this payment scope: **checkout 8/10**, **tracking/recovery 7/10**. These reflect verified tax, input enforcement, durable recovery and on-site button behavior; they are not measured conversion improvements or an overall-site rescore. A real purchase, inbox arrival, GA4 transaction visibility and connector import remain the material evidence gaps.

5. User requested a **$1 total owner test** instead of the $181.91 cart. Prepared an authenticated admin-only test action and settings panel: server fixes the recipient to the signed-in admin and a $0.90 test line, obtains real sales tax, and only allows exactly $1.00 including $0.10 tax. No public pricing or minimum change. Receipts say no production; GA4 marks internal test traffic. Reuses normal wallet capture, finalizer, receipts and recovery. Requires live deployment/quote verification, then user Apple Pay approval. Verify one processor capture, one saved paid order with artwork, receipt arrival, matching GA4 transaction, and one connector accounting import with tax/fees. Do not independently create an accounting sale or refund without authorization.
6. Give updated readiness ratings with separate live/fixture evidence. No conversion claims and no overall-site rescore based only on checkout work.

- Primary integration reference: https://developer.paypal.com/v5/apple-pay/integrate/ (read September 15). Production registration requires merchant provisioning and the hosted domain file; the documented current Apple SDK supports non-Safari browser handoff. Intuit's public direct charges contract still does not document Apple Pay token acceptance.

## Current production release

- Deployed source `01972fb` via READY deployment `dpl_39gvNensawvZuv6qYzuc1T3ZZFAw`, promoted to tssprint.com.
- Public checkout configuration verified `enabled:true`, `direct:true`, `environment:production`. Invalid charge requests are rejected before any processor operation.
- Owner completed production Payments consent. Both new migrations are applied; RLS and absent customer/anonymous SELECT permissions verified.
- Corrected accounting reconciliation and invalid-card handling using actual sandbox results; [verification evidence](./quickbooks-native-sandbox-verification.md). All 66 QuickBooks tests, TypeScript and changed-component lint passed.
- On the live two-item verification cart, the server calculated subtotal $182.50, AUTO10 discount $18.25, tax $17.66, total $181.91. Card fields and Pay $181.91 appeared on `/checkout` without an invoice review screen or QuickBooks redirect. Desktop and 390px phone-width form checked; viewport restored.
- No real card entered or charge submitted. The user must choose and approve a real purchase before claiming live charge/order/receipt/GA4 verification. Existing hosted invoice recovery remains available for earlier checkouts.

## Earlier staged release — superseded by the release above

- Signed-in Intuit dashboard confirms app `2c74468e-cabf-4bdc-ae91-29d33195ad87` is IN PRODUCTION. Both Accounting and Payments permissions are selected. This does not establish the live connection's granted scopes or a successful merchant charge.
- Preserved the latest live source (`5cae66f`, Google sitelink signals and preceding sticker/mobile updates) in merge `31fdb8b`.
- Staged release `dpl_FsEGE1RXJUGPAtSpgJFWG5HiL1XH` is READY at `tssprint-5qfw0ntjc-jordis-projects-94d2df39.vercel.app`; it has not been promoted. Its configuration returns `enabled:true`, `direct:false`, `environment:production`. A charge request returns `direct_payments_unavailable` as intended.
- All 64 QuickBooks tests and the merged production bundle build passed.
- Intuit API Explorer's sandbox-only $1 dummy-card charge returned HTTP 401 (Intuit transaction ID `1-6aa98fbf-5896bddb006bc093196c1ff9`). No successful charge is claimed. The selected sandbox has Accounting and Payments enabled. Prepared a fresh sandbox OAuth consent page; it is awaiting the user's Connect action.
- Supabase dashboard session expired. Its GitHub sign-in is open, awaiting the user. Both new database migrations remain unapplied.
- Next: complete those two browser actions, apply and verify migrations, verify real sandbox token → charge → accounting Payment behavior, connect production Payments from the deployed admin, and perform the user-authorized live payment check before public activation.

## Implementation progress

- Added separate Payments OAuth permission, server-bound scope storage and preservation through refresh, plus an admin connection action. Both migrations are applied and the owner completed the production connection.
- Added the token-only Payments client and a direct-charge flow under the existing durable checkout lock. Captured charges are verified for identity, currency and amount before accounting finalization. Repeat submissions recover the original transaction; a lost charge response with no transaction ID requires review instead of another charge.
- New direct checkouts disable hosted invoice payment and display tax and card fields inline. This first version calculates tax after a deliberate on-page action, avoiding invoice creation on every keystroke. Accounting still uses an invoice internally; customers do not navigate to it before card entry.
- Known declines can retry another card up to three attempts on the same invoice. Unknown outcomes cannot expose a fresh Pay action.
- The new flow stays behind `QUICKBOOKS_DIRECT_PAYMENTS_ENABLED`; it is true in the current production release. Earlier hosted invoices keep their original recovery path.

### Verified during implementation

- Apple’s real demo opened its Apple Pay window in Chrome on this Mac and displayed **Scan Code with iPhone (iOS 18 or later)**. This verifies the browser handoff only, not a completed wallet transaction, TSS merchant validation, or Intuit wallet processing.
- Intuit’s sandbox token endpoint returned HTTP 201 for its published dummy card, with a token present. Its preflight allowed the TSS origin and the request headers. No charge was requested; no token value was printed or saved.
- Local browser fixture reached payment confirmation without leaving the site. The 390px mobile layout was visually checked. This fixture uses simulated provider responses, not real accounting or payment writes.
- QuickBooks unit/integration tests and the production bundle build passed. See the current task’s verification output for the final count.

### Remaining production verification

1. Complete a user-approved real purchase and verify the live merchant charge, saved order, receipt delivery and GA4 purchase. Card activation and sandbox success do not establish those results.
2. Confirm production settlement, deposits and fees. The required reconciliation metadata is verified in sandbox, but actual bank reconciliation is not.
3. Finish the approved PayPal Apple Pay release gate above. Native Intuit card checkout stays in place.

Additional primary references inspected in Chrome: [browser tokenization](https://developer.intuit.com/app/developer/qbpayments/docs/workflows/create-tokens), [charge contract](https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/charges), [payment/accounting workflow](https://developer.intuit.com/app/developer/qbpayments/docs/workflows/process-a-payment), [Accounting Payment](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/payment), [Payments release notes](https://developer.intuit.com/app/developer/qbpayments/docs/release-notes/quickbooks-payments-release-notes), and [Apple’s demo](https://applepaydemo.apple.com/apple-pay-js-api).

## Outcome

Customer flow: cart → one checkout with delivery, artwork summary, discounts, tax and payment → confirmation on tssprint.com. Remove the mandatory invoice review page and hosted QuickBooks payment redirect from the new direct-card journey. Keep QuickBooks as the intended payment processor and accounting system.

The current public checkout creates its tax invoice internally and displays card fields on tssprint.com. The Payments API charges a tokenized card, and the Accounting API links the captured charge to the invoice. Those are separate operations; an accounting entry alone is not proof of payment.

## Execution order

### 1. Establish the supported payment integration

- Verify this Intuit app has production Payments API access and the merchant account is eligible. The existing accounting connection alone does not prove either.
- Add `com.intuit.quickbooks.payment` alongside accounting access, record granted scopes, and reconnect the owner when the implementation is ready for that connection. Keep credentials and refreshed tokens on the server.
- Verify Intuit's current supported browser tokenization integration, authentication/CORS requirements, and applicable card-data handling requirements. Do not invent a hosted-fields SDK or expose OAuth tokens to the browser. Card numbers and security codes must not pass through TSS API bodies, logs, analytics, or storage.
- Resolve Apple Pay support for this specific direct API integration before promising it. Verify wallet token acceptance, merchant validation, domain registration, and eligible-browser behavior. Intuit's hosted-invoice Apple Pay support is established; support for an embedded TSS implementation is not yet established.
- If Intuit cannot support the required on-site wallet experience, document that precise limitation and the alternative processor option before changing processors. Do not substitute an invoice redirect behind an Apple Pay button.

### 2. Put the final tax-inclusive amount on checkout

- Reuse server-approved product pricing, discount validation, taxable product mappings, and customer delivery/pickup details.
- Resolve how to obtain Intuit's tax calculation without creating a fresh customer/invoice for every address keystroke. First verify a supported tax-preview mechanism. If a controlled pending invoice is necessary, use one versioned preparation flow, with no online payment link, and manage superseded records explicitly.
- Show subtotal, discount, delivery, tax and final total beside payment fields. Recalculate when relevant details change and invalidate the old payable amount.
- Bind the charge to the server's current quote version, currency and order. Never trust a browser-supplied total or fall back to a guessed flat tax rate.

### 3. Add direct charging and recovery

- Add a separate Payments API client for tokenized charges and charge status. Preserve the existing encrypted connection and sanitized Intuit request-ID logging.
- Persist a payment attempt before the external charge. Serialize submissions and use the provider's documented idempotency/request-ID semantics, including its retention limits.
- Distinguish declined, processing/unknown, authorized, captured and refunded states. A timeout must trigger status recovery, not a fresh charge. If a result cannot be resolved automatically, keep the order in review and prevent blind retries.
- Ensure a direct attempt and a hosted invoice cannot both collect payment for the same order. Preserve recovery of older hosted-invoice purchases without exposing both payment routes for new direct attempts.
- Save the verified charge identifier and amount. Only confirmed payment should advance the order to payment received; proof approval and production remain separate.

### 4. Finish the customer experience and accounting

- Replace the invoice-review button in `QuickBooksPayment.tsx` with the supported card-entry flow and a clear `Pay $total` action. Keep validation errors next to the relevant fields and preserve customer details after a decline.
- Where supported and verified, show the native Apple Pay button and sheet. Avoid intermediate screens or redundant customer-detail entry.
- Show confirmation and an itemized receipt on TSS. Retain `/payment-status` for recovery and older invoice payments, not as a required prepayment step.
- Verify whether a native Payments API charge automatically creates any accounting records. Explicitly create/link only the missing itemized accounting records, exactly once; avoid duplicate sales or payments. A delayed accounting sync must not ask an already-paid customer to pay again.
- Reuse durable jobs for receipts, accounting recovery, cart conversion and purchase analytics. Report paid status independently from email, accounting and analytics delivery statuses.

### 5. Verify and release

- Use sandbox to exercise successful and declined cards, expired tokens, stale quotes, double-clicks, concurrent submissions, timeouts after charge, reconnect/refresh failures, and retries after accounting/email failures. Sandbox is for these destructive failure cases; production remains the destination.
- Check desktop, mobile, keyboard operation, slow networks, refresh/back navigation, artwork persistence, and exact tax/discount totals. Verify Apple Pay with an eligible real device if supported.
- Release behind a direct-payments flag. Keep the current payment path operational until the replacement passes; resolve in-flight attempts through their original route.
- Complete one explicitly approved small live payment, with the user entering payment credentials. Verify the processor transaction, one saved order, matching QuickBooks records, received receipt, and purchase in GA4. Refund only when authorized.
- Test customer analytics in a session that follows consent rules and is not excluded as staff. GA4 configuration or an accepted Measurement Protocol request alone does not prove a purchase appeared in reports.

## Acceptance criteria

- Card customers stay on tssprint.com through checkout and confirmation, apart from any issuer-required authentication.
- The displayed tax-inclusive amount matches the verified charge and accounting total.
- Repeated clicks, network failures and retries do not create duplicate charges or accounting entries.
- One verified payment produces one order, with recoverable accounting, receipt and analytics jobs.
- Apple Pay is advertised only after an actual supported on-site flow is verified; unresolved support is reported explicitly.
- Existing orders, artwork, staff exclusions, tax enforcement and hosted-payment recovery continue to work.

## Likely implementation areas

`src/components/QuickBooksPayment.tsx`, `src/pages/Checkout.tsx`, `src/pages/PaymentStatus.tsx`, `src/lib/quickbooksCheckout.ts`; `server/quickbooks-api.js`, `server/quickbooks-core.js`, `server/quickbooks-checkout.js`, `server/quickbooks-invoices.js`, worker/delivery handlers; new direct-payments client/routes and private attempt migrations. Final file boundaries follow the confirmed API contract.

## Evidence ledger

Reviewed 2026-09-15. Sources describe provider capability, not approval of this particular merchant/app.

| Source | Established | Still to verify |
| --- | --- | --- |
| [Intuit's official Payments API collection](https://www.postman.com/intuit-developer/intuit-developer-quickbooks-payment-api/overview) and [requests](https://www.postman.com/intuit-developer/intuit-developer-quickbooks-payment-api/collection/4884662-55f5b175-5f9d-4b03-8687-d544cddde270) | Card charging, tokenization and dedicated payment scope are available. | Exact tokenization/charge contract, merchant production entitlement, retry semantics and wallet support. |
| [Intuit Payments OAuth documentation](https://developers.intuit.com/app/developer/qbpayments/docs/develop/authentication-and-authorization/oauth-2.0) | Payments access uses its own OAuth scope. | Current app's granted production scopes. |
| [Intuit Apple Pay FAQ](https://quickbooks.intuit.com/learn-support/en-us/help-article/receive-payments/frequently-asked-questions-apple-pay-quickbooks/L1yOQUp7l_US_en_US) | Apple Pay is documented for eligible hosted e-invoice payments. | This is not evidence that the direct Payments API accepts an on-site Apple Pay token. |
| [Apple Pay planning](https://developer.apple.com/apple-pay/planning/) | The payment provider must support the wallet-processing flow; Apple recommends immediate presentation of the payment sheet. | Intuit-specific integration and TSS domain/merchant setup. |
| Source and live deployment inspection | Separate Payments OAuth and tokenized direct charging are enabled; database migration and production scope grant verified. | A real-money purchase, receipts, GA4 and production settlement remain unverified. |
