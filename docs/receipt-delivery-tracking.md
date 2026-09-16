# Receipt delivery tracking

## What is implemented

- Admin → QuickBooks → Load payments now includes all four follow-up jobs for the displayed checkouts, including accepted receipts and analytics jobs.
- Email API acceptance is separate from signed delivery reports. Delivery means acceptance by the recipient mail server, not inbox placement or reading.
- `POST https://tssprint.com/api/quickbooks/email-webhook` verifies the raw body with Svix and the private `RESEND_WEBHOOK_SECRET`. Missing configuration fails closed (503); invalid/tampered/stale signatures fail (401).
- Private `resend_delivery_events` keeps only event ID, provider email ID, type and timestamps. No addresses, subjects, bodies or tracking links. Duplicate callbacks are ignored. Events arriving before sender persistence are retained and joined by provider ID later.
- Out-of-order sent/delay events cannot hide delivery. Bounce/failure/suppression/complaint reports remain visible, including mixed staff-recipient outcomes. No callbacks resend emails or alter payment status.
- Receipt history is limited to the same latest 50 company checkouts that admin displays. Unavailable delivery storage does not hide the existing payment/send evidence.

## Activated in production — September 15, 2026 (Pacific)

The correct Resend workspace is `thestickersmith`, signed in as `thestickersmith@gmail.com`. Both original Apple Pay emails are marked **Delivered** in this workspace:

- Customer receipt: `4be65515-9899-4c52-90c1-f9e65a37014d`
- Staff notification: `61e8cb75-5bbf-45ac-96bc-6e8db432b41c`
- Both subjects reference transaction `224553862Y4866814`.

Webhook `a364758a-69eb-4599-b23f-d28bf31b555c` is enabled for the seven implemented events. Its signing key is saved as a Secret, Production only, in the existing Vercel project. Deployment `dpl_FE4X9NH7VYHzzTX4NyLG3kkznvgY` (source `3c23a69`) activates the configuration. An unsigned POST returns 401.

Two emails were sent only to Resend's official simulation destinations, with idempotency keys and no customer/order data:

- Delivered simulation: `9b115ad4-939f-4b8e-aaaa-a6acb2eae00d`; signed sent + delivered callbacks returned HTTP 200 and persisted.
- Bounced simulation: `4922bdde-4b24-4504-b544-7c3790acf2db`; signed sent + bounced callbacks returned HTTP 200 and persisted.

The stored summaries correctly show delivered and bounced. The delivered callback was replayed; Resend shows HTTP 200 with two attempts, and its stored event count remained two (one sent, one delivered). The original payment follow-ups still have exactly one attempt each. No additional payment or replacement customer receipt was sent.

The old $1 receipts predate webhook creation, so their dashboard delivery evidence is verified separately; admin has no historical signed callbacks for them and still labels their delivery unconfirmed. Future callbacks join automatically by provider ID. No historical delivery events were fabricated or backfilled from test data.

[Resend test addresses](https://resend.com/docs/dashboard/emails/send-test-emails) and [replay documentation](https://resend.com/docs/webhooks/retries-and-replays).

## Validation

15 email-delivery, retry and route tests pass; changed-component ESLint and full production build pass. Tests cover signatures, stale/tampered callbacks, duplicate handling, minimal storage, unmatched-event persistence, out-of-order reports, mixed recipient outcomes, admin query scoping, read failures and public route rejection.

Migration `20260916030000_resend_delivery_tracking.sql` applied through Supabase SQL editor; success verified in UI and REST reads. Service-role access succeeds; anonymous reads are rejected for both table and summary view. No fabricated delivered status was inserted for a real receipt.

Live admin now explicitly confirms signed callbacks are configured. The original receipt delivery was verified from Resend, and the new callback pipeline was separately verified using provider-generated simulated events.

## Deployment

Source `3900904` promoted to production as `dpl_BTLVeJcfaJVw4kavrryRdt5RFX29`. The deployed callback rejects requests while the signing secret is unconfigured; unauthenticated admin reads return 403. Production checkout configuration still reports enabled, native cards enabled, and Apple Pay enabled. The full payment/owner/email regression run passed 78 tests. No second charge or replacement receipt was sent.

Live authenticated admin verification succeeded after promotion: Apple Pay order `224553862Y4866814` shows payment recorded, $1 including $0.10 tax, customer and staff receipts accepted with delivery unconfirmed, cart linking completed, and GA4 transport accepted. Recovery worker completed with zero pending/review follow-ups. The separate skipped card test still shows awaiting payment. This was the pre-activation state; the activation and live provider tests above resolve that blocker.
