# Receipt delivery tracking

## What is implemented

- Admin → QuickBooks → Load payments now includes all four follow-up jobs for the displayed checkouts, including accepted receipts and analytics jobs.
- Email API acceptance is separate from signed delivery reports. Delivery means acceptance by the recipient mail server, not inbox placement or reading.
- `POST https://tssprint.com/api/quickbooks/email-webhook` verifies the raw body with Svix and the private `RESEND_WEBHOOK_SECRET`. Missing configuration fails closed (503); invalid/tampered/stale signatures fail (401).
- Private `resend_delivery_events` keeps only event ID, provider email ID, type and timestamps. No addresses, subjects, bodies or tracking links. Duplicate callbacks are ignored. Events arriving before sender persistence are retained and joined by provider ID later.
- Out-of-order sent/delay events cannot hide delivery. Bounce/failure/suppression/complaint reports remain visible, including mixed staff-recipient outcomes. No callbacks resend emails or alter payment status.
- Receipt history is limited to the same latest 50 company checkouts that admin displays. Unavailable delivery storage does not hide the existing payment/send evidence.

## Activation still required

Sign into the existing Resend workspace that sends tssprint.com receipts. Current local key can send only; it cannot retrieve email delivery history or configure webhooks. The previously inspected Google-login workspaces were empty.

1. In that workspace, create a webhook for the endpoint above.
2. Subscribe to `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.failed`, `email.complained`, `email.suppressed`.
3. Save its signing secret as protected production server variable `RESEND_WEBHOOK_SECRET`; deploy so the callback can verify it. Never expose the secret in frontend code or notes.
4. Use Resend's event replay for the two existing $1-test receipts where available; do not send replacement receipts just to obtain a webhook. If historical events cannot be replayed to the new endpoint, inspect their delivery logs separately and leave admin history unconfirmed until real signed events arrive.
5. Verify one provider delivery report matches the stored provider ID and admin status, and check webhook response is 200. Verify repeated delivery/replay does not create new emails, orders or purchases.

## Validation

15 email-delivery, retry and route tests pass; changed-component ESLint and full production build pass. Tests cover signatures, stale/tampered callbacks, duplicate handling, minimal storage, unmatched-event persistence, out-of-order reports, mixed recipient outcomes, admin query scoping, read failures and public route rejection.

Migration `20260916030000_resend_delivery_tracking.sql` applied through Supabase SQL editor; success verified in UI and REST reads. Service-role access succeeds; anonymous reads are rejected for both table and summary view. No fabricated delivered status was inserted for a real receipt.

Until activation and a real callback are verified, admin explicitly says delivery tracking setup is pending. Local tests do not establish receipt delivery.

## Deployment

Source `3900904` promoted to production as `dpl_BTLVeJcfaJVw4kavrryRdt5RFX29`. The deployed callback rejects requests while the signing secret is unconfigured; unauthenticated admin reads return 403. Production checkout configuration still reports enabled, native cards enabled, and Apple Pay enabled. The full payment/owner/email regression run passed 78 tests. No second charge or replacement receipt was sent.

Live authenticated admin verification succeeded after promotion: Apple Pay order `224553862Y4866814` shows payment recorded, $1 including $0.10 tax, customer and staff receipts accepted with delivery unconfirmed, cart linking completed, and GA4 transport accepted. Recovery worker completed with zero pending/review follow-ups. The separate skipped card test still shows awaiting payment. Resend login is the remaining activation blocker.
