# QuickBooks checkout execution plan

## Outcome
Customers review an itemized, server-priced order, continue to Intuit's hosted invoice payment page, and receive accurate paid / artwork / proof / production states. Card payments and eligible-device Apple Pay feed the same QuickBooks invoice. PayPal remains available separately.

## Ordered work
1. **In progress:** Read production payment preferences, catalog/income accounts, currency and tax configuration. Select mappings from evidence; resolve any merchant-specific tax question before enabling sales.
2. Persist private checkout attempts before creating invoices; freeze validated cart, customer, artwork, attribution and provider payload. Bind attempts to the production company; use stable provider request IDs and database leases for retries.
3. Show invoice amount/tax and hosted payment link. Keep an unpaid-order status page and recovery link; never mark browser return as payment. Prevent repeated creation for the same attempt.
4. Reconcile invoice and linked payment evidence on the server, including browser-closed payments, credits, partial payments, mismatches and replay. Atomically save orders and notification jobs. Report accounting payment versus processor settlement accurately.
5. Add durable receipt/staff notifications and purchase tracking with deduplication, recovery status and staff review for ambiguous outcomes.
6. Test pricing tampering, duplicate clicks, lost responses, private access, failures and mobile checkout. Deploy from the current combined release. Verify a specifically authorized real payment and eligible-device Apple Pay before claiming end-to-end success.

## Current evidence
- Production OAuth and CompanyInfo read verified for The Sticker Smith.
- Policies/disclosure live at /terms and /privacy; registered in Intuit.
- Existing sandbox invoice/payment fixture verified accounting linkage only.
- No production invoice or real payment has been created by this task.
- Current deployed base: ff1d13d; preserve customer-task changes.

## Sources
- https://quickbooks.intuit.com/learn-support/en-us/help-article/receive-payments/frequently-asked-questions-apple-pay-quickbooks/L1yOQUp7l_US_en_US
- https://developer.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice

Apple Pay is offered by the hosted invoice on eligible Safari / Apple Wallet setups. An OAuth connection does not establish that the merchant can collect a card payment.

## Verification checkpoint — September 14, 2026 (late evening)
- Applied private checkout, delivery queue, request-limit and webhook-event tables to production Supabase.
- Fixed the live `orders_payment_status_check` to accept accounting `payment_recorded`, separate from processor `captured`.
- Verified actual database atomic finalization, four follow-up jobs, duplicate finalization, and denied public access in a rollback-only transaction. No fixture orders retained and no emails sent.
- Missing attribution now defaults to an empty object, preserving orders when analytics is unavailable.
- Saved Intuit production Invoice and Payment subscriptions with CloudEvents enabled and stored the webhook verifier as a protected production Vercel secret. Delivery still needs a deployed endpoint and an observed provider event.
- Local tests: 33 QuickBooks tests and 23 checkout/analytics tests passed; TypeScript/build and scoped lint passed before the final email markup review.
- Prepared branded QuickBooks receipts using the existing white script logo, individual line prices, sales tax, total, and proof-approval next steps. Local Chrome preview inspected.
- User supplied quarterly filing and January period start. Existing agency start date January 1, 2012 and accrual method were preserved. No tax rate was hardcoded.

### Remaining release gates
- Deploy latest combined customer/recovery changes with this checkout patch; public QuickBooks flag remains off during staff verification.
- Inspect a real unpaid website invoice and Intuit payment page; confirm tax and card availability. No production invoice or charge created at this checkpoint.
- Configure and verify GA4 Measurement Protocol purchase delivery; transport acceptance alone is not report verification.
- Resolve existing PayPal/Square paths that currently omit separate tax before presenting them beside taxed QuickBooks checkout.
- Complete catalog mappings for remaining purchasable categories, then authorized real card payment, eligible-device Apple Pay, receipt and paid-order checks.

## 2026-09-15 — automatic recovery verified live

- Production release 75e3ac4: https://tssprint-az17rlc7u-jordis-projects-94d2df39.vercel.app, promoted to tssprint.com.
- Installed 20260915090000_quickbooks_worker.sql and scheduled tss-quickbooks-recovery every 2 minutes. It dispatches only when work is due; each worker request has an expiring, single-use token and private database leases.
- Rollback-only database assertions passed for anonymous/authenticated access denial, wrong/expired/reused worker tokens, concurrent event leases, and expired lease recovery.
- Replayed the existing unpaid invoice 3275 as event recovery-verification-20260915, deliberately locking only that verification checkout. At 07:58 UTC the scheduled worker returned HTTP 200 and left the event pending with checkout_busy. After releasing the test lock, the next scheduled worker processed it at 08:00:02 UTC. Two attempts, error cleared, invoice still awaiting_payment, no paid order and zero follow-up jobs. No payment was made or email sent.
- Admin now reports scheduler status, most recent run and pending/review follow-up counts.
- New invoices use the customer's name, payment due on the order date, and an unpaid memo that does not imply payment received. Existing invoice 3275 was not rewritten.
- Public QuickBooks launch, GA4 acknowledgement/key and a real customer purchase remain separate checks. A worker HTTP 200 or unpaid invoice does not prove processor settlement or inbox delivery.
