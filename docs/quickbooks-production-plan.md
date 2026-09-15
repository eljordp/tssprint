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
