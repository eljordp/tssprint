# QuickBooks connection setup

This is an admin-only connection foundation. It does not add QuickBooks to customer checkout, create invoices, charge cards, or record PayPal sales in QuickBooks.

## Server configuration

Apply `supabase/migrations/20260915020000_quickbooks_connection.sql` to the same Supabase project used by the production server. The two tables and refresh-lock RPC are service-role-only. Keep the existing Supabase environment variables.

Set these server variables (never use a `VITE_` prefix):

| Variable | Value |
| --- | --- |
| `QUICKBOOKS_ENVIRONMENT` | `sandbox` initially |
| `QUICKBOOKS_SITE_URL` | `https://tssprint.com` |
| `QUICKBOOKS_SANDBOX_CLIENT_ID` | Intuit app development client ID |
| `QUICKBOOKS_SANDBOX_CLIENT_SECRET` | Intuit app development secret; protected secret |
| `QUICKBOOKS_TOKEN_ENCRYPTION_KEY` | 32 random bytes encoded as 64 hex characters; protected secret |

Do not replace the encryption key while encrypted connections exist without a key migration or reconnection plan. Missing settings fail closed and are visible in Admin → QuickBooks.

Register `https://tssprint.com/api/quickbooks/callback` in the Intuit app's development redirect URLs. The authorization scope is `com.intuit.quickbooks.accounting`; only The Sticker Smith's admin connects the company. Do not request end-customer Intuit credentials.

Production credentials, when approved, use `QUICKBOOKS_PRODUCTION_CLIENT_ID` and `QUICKBOOKS_PRODUCTION_CLIENT_SECRET`. Changing the environment does not enable invoice checkout.

## Connection behavior

- Fetch and validate Intuit's official discovery document.
- Bind a random, expiring, single-use OAuth state to an HttpOnly, Secure, SameSite=Lax browser cookie.
- Recheck the initiating user's admin role when completing the callback.
- Encrypt access and rotating refresh tokens using AES-256-GCM, authenticated to the company and environment.
- Reuse access tokens until within 60 seconds of expiry. Refresh under a database lock.
- Retry a company read once after a 401 and successful refresh. Do not loop on invalid grants or automatically repeat ambiguous token exchanges.
- Clear unusable tokens and require reconnection on an expired refresh token or invalid grant.
- Revoke access when disconnecting; keep existing accounting records intact.
- Log operation, HTTP status and sanitized `intuit_tid`; exclude tokens, raw provider payloads and personal data.

## Validation

`npm run test:quickbooks` runs local mock-provider tests. These are not a substitute for a real Intuit sandbox company test.

Before marking the Intuit questionnaire's sandbox test complete:

1. Connect a sandbox company through Admin → QuickBooks.
2. Use Check connection to confirm the actual sandbox company name.
3. Disconnect and verify revocation, then reconnect and check again.
4. Verify deployed logs capture the real Intuit transaction ID without credentials.
5. Review authorization expiry, failure, database access and concurrency behavior in the deployed environment.

Before offering customer card/Apple Pay checkout, implement and verify itemized invoices, tax treatment, idempotency, hosted payment links, payment status reconciliation, receipt behavior, and eligible-device Apple Pay. Existing PayPal/Square connectors must not be duplicated.

## Itemized sandbox invoice test (September 14)

Apply `supabase/migrations/20260915043000_quickbooks_invoice_tests.sql`. In the signed-in admin QuickBooks panel, create the sandbox test invoice, recheck it, then simulate an accounting payment. The test uses a server-priced 250-card batch, soft-touch and WELCOME15, a reserved example.com address, and one persistent invoice per sandbox company. No `/send` call is made; Intuit can auto-email imported invoices according to merchant settings, so the fixture has no real recipient and clears CC/BCC.

The local ledger is service-role-only. It preserves the exact invoice payload before writing, uses stable Intuit `requestid` values, serializes attempts, and binds reads/writes to the sandbox realm. A lost response can be retried without creating another invoice. The test cannot run against production and never writes to storefront orders, sends a purchase event or confirms a real charge.

Payment checks require the expected invoice/customer/USD total plus linked payment allocations. Zero balance alone, partial payments, credits, voided totals and mismatched records do not become a paid result. A simulated entry explicitly sets `ProcessPayment:false`; “payment recorded” establishes accounting linkage only. Real card/Apple Pay authorization, settlement, hosted invoice link behavior, email delivery and order fulfillment still need separate verification.

### Still required before public checkout

Production credentials and merchant consent; reviewed product/account mapping and sales-tax treatment; persisted customer checkout attempts and a protected return/status page; server-side order finalization and notification retry handling; webhook or scheduled reconciliation when the browser closes; live payment and refund tests with the owner; privacy/terms publication after the drafts in `docs/policies/` are reviewed. Do not enable a public QuickBooks button on the strength of the sandbox accounting test.
