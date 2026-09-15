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
