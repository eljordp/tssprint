# Live Apple Pay verification — September 15, 2026

The owner approved a real $1 Apple Pay payment on an iPhone at approximately 16:21 Pacific. This used the authenticated owner test; normal customer prices and minimums were unchanged.

## Verified

- Production checkout: `c8197469-4b88-428f-8fd7-114ede1a4bbe`.
- QuickBooks tax estimate: `3286`; $0.90 product value + $0.10 tax = $1.00 charged.
- PayPal order / TSS saved order: `224553862Y4866814`.
- Capture: `70B01520W0866370S`; stored provider state `COMPLETED`, paid true; saved order state `captured`.
- One saved order remains after repeated payment-status checks. Item is explicitly “Owner payment test — no production.”
- Customer returned to the confirmation page on tssprint.com.
- GA4 property **The Sticker Smith - tssprint.com**, ID `541419462`: DebugView visibly shows one `purchase` at 16:21:18. Its `transaction_id` is `224553862Y4866814`, `value` is `0.9`, `tax` is `0.1`, and `payment_type` is `apple_pay`. Preceding checkout, shipping and payment-information events are visible.
- This is internal/debug test traffic. DebugView receipt is verified; inclusion in standard customer acquisition/revenue reports is not claimed.
- Four durable follow-up jobs each have one attempt: analytics accepted, cart-link job completed, customer email accepted, staff email accepted. This synthetic test did not contain a real shopping cart or artwork; it does not prove cart conversion or artwork fulfillment.
- Resend accepted customer message `4be65515-9899-4c52-90c1-f9e65a37014d` and staff message `61e8cb75-5bbf-45ac-96bc-6e8db432b41c`. Accepted is not proof of inbox delivery. The configured API key is send-only; read access correctly returns 401.

## Remaining checks

1. Confirm receipt arrival at `thestickersmith@gmail.com`. User confirmation requested; available Gmail connector belongs to another account. Neither available Google-login Resend workspace shows the project's sending history.
2. Confirm the PayPal Connector imports one accounting sale with matching tax and fees. QuickBooks is at its password screen; user sign-in requested. No extra sale or invoice was created manually.
3. Verify settlement/deposit against the bank later. No refund requested or performed.
4. Native Intuit card processing still needs its own real purchase verification. Apple Pay success establishes the PayPal wallet path, not the separate card processor.
5. A normal customer checkout with real artwork and ordinary analytics consent remains a distinct acceptance check.

## Follow-up fix

Source `12fb264` changes the confirmation page to display the saved order ID used by receipts and GA4. Owner tests explicitly say no artwork, printing or shipping. Public status adds only a boolean owner-test marker, not the owner's user ID. Thirteen existing checkout/owner tests, changed-file ESLint and the full production build passed.

That correction was deployed and verified on the paid order. Reload also exposed a pre-existing flash of prerendered 404 content before the app loaded. The follow-up adds `/payment-status` to the generated private app-shell routes; both generated HTML aliases were checked for the correct title, noindex metadata and absence of 404 content.

## Readiness judgment

Payment checkout **8.5/10**; tracking/recovery **8/10**, up from 8 and 7 respectively. These are judgments for the payment scope based on the verified live capture/order/GA4 flow. They are not an overall-site audit, measured conversion improvements, proof of every recovery scenario, or verification of the separate native-card path.

## Follow-up verification and next order of work

### Native Intuit card test: prepared, then skipped by the user

- Live source `36f0d3b`, deployment `dpl_8AU5RdfzWUf3aRUzdnFuKRCMsRK7`, adds a card option to the authenticated owner test. The completed Apple Pay attempt stays separate and is not reused or repeated.
- Method is server-validated; prices, recipient and discount remain server-fixed. The direct-charge path checks the exact $1 total and $0.10 tax again before submitting to the provider, including under the checkout lock.
- Seventeen owner/card/route tests, changed-component ESLint and production build passed. Staged configuration showed direct cards enabled in production; unauthenticated test preparation was rejected.
- Live owner card checkout `4fb932f8-b132-47c5-bb27-cab081c93138`, invoice `3287`, returned $0.90 subtotal + $0.10 tax = $1.00. The owner card form was displayed, then closed after the user clarified that they already paid with Apple Pay. Read-only recheck confirmed awaiting payment with no order ID. No second payment was made.
- This is a **second real $1 charge** only if the user enters their card and approves it. The user replied that they already paid with Apple Pay, so no further card payment was requested. The separate native-card live check remains unverified; it does not invalidate the successful Apple Pay check.
- Live admin also visibly confirms the original Apple Pay order as payment recorded, $1 including $0.10 tax, transaction `224553862Y4866814`. The worker's last run completed, with zero follow-ups pending or needing review. The accounting-import delay does not negate the verified captured payment.

The later September 15 recheck still shows the same completed $1 payment, no checkout error, and one attempt for each follow-up job. The owner subsequently restored QuickBooks access. Inbox confirmation remains pending.

### Signed-in QuickBooks check

- Correct company: **The Sticker Smith**. Opened Accounting → Integration transactions → PayPal, connection `be72a87d-4851-4434-a45b-36d4c8933e92`.
- Applied a September 15–16, 2026 date filter. **For review, Categorized and Excluded all contain no transactions for this range.** Therefore the $1 capture's accounting import, tax and fees are still unverified; this is no longer a login blocker.
- Connector settings: sync start date January 1, 2025; automatic posting, product tracking, customer tracking and supplier tracking are all ON. No settings were changed, no transactions were confirmed/excluded, and no replacement accounting sale was created.
- The home page's bank card reported its last PayPal update 21 hours earlier. This is a bank-feed timestamp, not proof of the connector's exact last sync. Intuit documents automatic checks throughout the day and no on-demand refresh for this connector.
- The home page separately warns that some QuickBooks Payments deposits were not automatically recorded. Their relationship to historical transactions has not been investigated; do not attribute that warning to this PayPal test. Flag for the owner/CPA's reconciliation review.
- The connector's deposit account is currently also set to “PayPal balance account.” Confirm the intended transfer destination with the owner/CPA before changing it; this inspection did not establish the correct bank account.

1. Finish receipt and accounting verification for this exact transaction before calling the full Apple Pay flow verified. Check the connector's imported sale, tax, fee and duplicate status; do not manually create a replacement sale just because an import is delayed.
2. Verify a small native Intuit card payment separately, with explicit approval for any additional real charge. Then check a normal customer order with actual artwork and customer analytics consent.
3. Add verified Resend delivery, bounce and delay callbacks to the existing admin delivery records. Current code stops at API acceptance. Resend's `email.delivered` means recipient-mail-server acceptance, not proof of inbox placement or reading. [Resend event definitions](https://resend.com/docs/webhooks/event-types).
4. Confirm PayPal product matching and fees in QuickBooks. The connector matches products by name; unmatched items can use the default PayPal Sales item while retaining the original name in the description. Verify the resulting records before changing product mappings. [Intuit connector documentation](https://quickbooks.intuit.com/learn-support/en-us/help-article/mobile-apps/use-paypal-connector-quickbooks-app/L5eoHQvLj_US_en_US).
5. Check the eventual settlement/deposit. Keep native-card, wallet, customer receipt, analytics and accounting statuses distinct in the readiness report.

### Receipt tracking follow-up

The user asked to continue after the successful Apple Pay test without another charge. The next change exposes completed receipt/analytics jobs in admin and prepares signed delivery/bounce/delay callbacks. See [receipt delivery tracking](receipt-delivery-tracking.md) for implementation, validation and the remaining Resend account activation.

### Resend verification completed

The owner signed into the actual `thestickersmith` Resend workspace. The exact customer and staff receipt IDs for transaction `224553862Y4866814` both show Delivered. This verifies recipient-mail-server delivery, not inbox placement or reading. Signed delivery tracking is now activated in production and verified with delivered/bounced provider simulations; see [receipt delivery tracking](receipt-delivery-tracking.md). The historical receipts predate webhook setup and were not artificially marked delivered in the callback table. Next remaining payment-scope check is the QuickBooks PayPal accounting import/tax/fees, followed by settlement reconciliation. No second card charge was requested or made.

### QuickBooks recheck after Resend activation — September 15 evening

The owner restored QuickBooks access again. Read-only checks in **The Sticker Smith** company:

- PayPal connector `be72a87d-4851-4434-a45b-36d4c8933e92`, September 15–16 filter: For review, Categorized and Excluded all empty. No current reconnect error was shown.
- Linked **PayPal balance account**, register account `175`: all 33 entries displayed, newest dated August 19, 2026. No September entry or the test capture was present.
- Advanced transaction search for capture reference `70B01520W0866370S`: no matching result. Then removed the reference filter and checked all transaction types September 15–16: 12 entries, comprising invoices and estimates, with no posted payment/deposit/sales receipt for this capture.
- The correct owner Apple Pay tax estimate (`c8197469`) appears for $1.00; it is not evidence of the PayPal sale posting. The skipped native-card test (`4fb932f8`, invoice `3287`) appears as an unpaid $1 invoice. Several earlier verification invoices are also still open; review explicitly identified test records for accounting cleanup before relying on receivables. No records were voided, deleted, reclassified, or recreated.
- The site's private record still shows `payment_recorded`, PayPal COMPLETED, order `224553862Y4866814`, capture `70B01520W0866370S`, $1.00 total and $0.10 tax.

The register also exposed two **possible historical duplicate expense pairs**, unrelated to this test. Matching dates, amounts and provider IDs warrant owner/CPA review; the inspection does not prove which entry should be removed:

| Date | Amount | PayPal transaction | QuickBooks register row transaction IDs |
| --- | ---: | --- | --- |
| 2026-08-19 | $112.61 | `6YE25142P5135592H` | `2975`, `2973` |
| 2026-07-31 | $376.00 | `4K989252263673002` | `2976`, `2974` |

Opened the exact PayPal capture in Chrome at `https://www.paypal.com/activity/payment/70B01520W0866370S`; PayPal requires owner sign-in. Asked the owner to sign in there to verify merchant account, gross, fee and net directly. The connector import and fee remain unverified. No assumption was made about settlement timing or the amount of the fee. No additional charge or replacement accounting sale was made.
