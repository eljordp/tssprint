# Customer verification — September 15, 2026

## GA4 receipt (01:14–01:17 PDT)

Independent browser check in property 541419462, stream G-4B9FXT1HQ9. A controlled sticker journey appeared in GA4 DebugView: page_view (2), view_item, artwork_option_selected, add_to_cart, add_to_cart_click, checkout_started, begin_checkout, delivery_method_selected. The begin_checkout detail showed source=codex, medium=verification, campaign=receipt_check_20260915, currency=USD, a clean /checkout page_location and the Die-Cut Matte Stickers item. This proves receipt for those events, not a purchase or every customer milestone.

The event value was $47.50; the cart subsequently displayed AUTO10 and $42.75. Initial checkout tracking currently fires before asynchronous promo loading settles. Do not use that initial value as paid revenue. Remaining work: defer the initial checkout value until promo resolution, and reconcile a completed paid order with purchase reporting.

Both GA4 Internal Traffic and TSS QA Developer Traffic filters remained in Testing. Historical/test activity may still appear in ordinary reports. No collection filter or consent acknowledgement was changed. These samples are not clean conversion-rate evidence. The single controlled send-later test cart item was removed through the normal cart UI. No upload, invoice, payment or email was generated in this verification.

Sources consulted: [Google DebugView](https://support.google.com/analytics/answer/7201382?hl=en), [developer traffic filters](https://support.google.com/analytics/answer/13296662?hl=en). Debug traffic can be inspected separately from ordinary reporting; validating configuration is not equivalent to validating a completed sale.

## Baseline PageSpeed measurement (01:14 PDT)

[Sticker report](https://pagespeed.web.dev/analysis/https-tssprint-com-stickers/4nokjb8v9h?form_factor=mobile), Lighthouse 13.4.1. One cold laboratory run, simulated Moto G Power / slow 4G for mobile. No CrUX real-user data was available. Scores fluctuate; these are not the subjective customer/admin ratings.

| Metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 68 | 92 |
| Accessibility | 95 | 95 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| First contentful paint | 3.2 s | 0.7 s |
| Largest contentful paint | 6.6 s | 1.7 s |
| Total blocking time | 20 ms | 100 ms |
| Layout shift | 0 | 0.009 |
| Speed index | 4.8 s | 0.7 s |

Confirmed findings: Google Fonts stylesheet added an external render-blocking chain; large thumbnail assets and unused JavaScript remain performance opportunities. The LCP element was the introductory H1, not a hero photograph. Do not attribute all delay to one cause. Lighthouse also identified white-on-cyan contrast, skipped heading levels and redundant adjacent image labels.

## Changes and verification

Change 6b57675; combined application ddca322 preserves the payment task through 4615c98 and its 9e28d59 validation change.

- Same Noto Sans appearance, now a locally bundled, preloaded variable Latin face with font-display: swap. Other scripts fall back to system fonts. No new Google Fonts stylesheet request is required.
- Primary/accent foreground changed from white to dark text. Theme-color contrast calculation improves 2.04:1 to 9.10:1. Explicit selected-state white text corrected in sticker/product ordering, artwork controls and project/FAQ filters.
- Sticker Quantity/Order Summary and footer sections use proper second-level headings without a visual size change. PrintTrust images no longer repeat the adjacent title to assistive technology.
- Services has a keyboard disclosure control. Enter → Tab reached Vehicle Graphics; Escape closed the submenu and restored the toggle focus.
- Mobile navigation uses a named modal, focus containment, a visible close button, Escape and focus restoration; it closes when resizing to desktop. Mobile header targets increased. A 390px screenshot showed an intact header, ordering controls and sticky checkout without horizontal overflow.
- Public layout has a visible-on-focus Skip to content link; Enter moved actual focus to main-content. Interactive controls have a consistent focus ring.
- Scoped ESLint passed. TypeScript/build and 33-route prerender passed. After combining the payment change, 33 checkout/analytics/QuickBooks checkout tests passed. Browser checks cover Chrome desktop and an emulated 390px viewport, not full screen-reader or real-device certification.

## Payment boundary

At 01:20 PDT, live admin Settings → QuickBooks showed production connected to The Sticker Smith, USD, sales tax and automated sales tax enabled; online card preference was not reported and requires invoice-level checking. Invoice 3275 remained awaiting payment, $133.86 including $12.99 tax. No paid test performed here.

The payment task's committed production record subsequently confirms public QuickBooks checkout enabled, card and Apple Pay choices visible on its hosted invoice, and no successful charge. Preserve that release. Remaining launch evidence: user GA4 acknowledgement/server measurement credential, approved real payment, paid order, actual receipt and purchase-event reconciliation. See quickbooks-production-plan.md. Mylar Packaging, Event Displays and Table Covers still require exact QuickBooks product mapping.

## Remaining scope

Responsive thumbnail delivery, route-level bundle reduction and repeated lab measurements; keyboard/screen-reader coverage across remaining forms/dialogs and real Safari/Android devices; cart item heading order; promo-settled begin_checkout values; GA4 test-filter activation decision and missing customer milestones; authorized paid purchase/receipt reconciliation. Exact material/stock evidence and matched real photography remain separate content gaps. The 602-entry Drive review remains deferred. No claim of a full accessibility certification or a 10/10 customer experience.

## Live release and remeasurement (01:28–01:33 PDT)

Promoted **ddca322** as **dpl_FrL9gVRTV6xv11FyEV4SLYueWLHn**, https://tssprint-f7mr7ozma-jordis-projects-94d2df39.vercel.app, to https://tssprint.com. Live DOM confirms local font preload, dark CTA text, skip link and corrected sticker headings; staged keyboard disclosure passed. Font asset returns HTTP 200 (35,820 bytes). Public checkout-config still reports enabled=true and quickBooksOnly=true with mapped categories, preserving the payment launch.

[After sticker report](https://pagespeed.web.dev/analysis/https-tssprint-com-stickers/8pw9d57hjt?form_factor=mobile):

| Metric | Mobile before → after | Desktop before → after |
|---|---:|---:|
| Performance | 68 → 68 | 92 → 95 |
| Accessibility | 95 → 100 | 95 → 100 |
| FCP | 3.2 → 2.3 s | 0.7 → 0.5 s |
| LCP | 6.6 → 6.2 s | 1.7 → 1.5 s |
| TBT | 20 → 240 ms | 100 → 30 ms |
| CLS | 0 → 0 | 0.009 → 0 |
| Speed index | 4.8 → 4.4 s | 0.7 → 0.7 s |

Best Practices and SEO remain 100 in both reports. This is one before/after sample; blocking time worsened in the mobile run, so do not claim the font change solved mobile performance. Lighthouse 100 accessibility covers its automated checks, not full conformance.

[Signage mobile report](https://pagespeed.web.dev/analysis/https-tssprint-com-services-business-signage/52jubd6u8w?form_factor=mobile): Performance 69, Accessibility/Best Practices/SEO 100, FCP 2.3 s, LCP 10.1 s, TBT 80 ms, CLS 0, Speed Index 4.6 s. No prior comparable signage lab score established in this pass. The LCP image was Curated Barbershop window lettering in the product choices, discoverable in initial HTML; Lighthouse recommends fetchpriority=high and estimates 937 KiB image savings. Raw LCP subpart panel showed 290 ms resource delay, 310 ms load duration and 1,850 ms render delay (these trace timings are not the simulated 10.1-second metric). Do not invent a single proven root cause from this report.

Production log sample returned one Node DEP0169 url.parse deprecation warning under cart/sync; no verified cart failure was established from that warning. No broad uptime claim. Later Chrome viewport override did not apply to the existing live tab (DOM stayed 1720px), so the live mobile keyboard retest is not counted; the local 390px manual test and public mobile Lighthouse run are the evidence. Overrides reset. No drains inventory performed.

## Mobile delivery and discount follow-up — September 15, morning

Application 00cbfe0 adds responsive WebP companions to the existing photographs, explicit thumbnail sizes, high priority for the first product choice, and removes the opacity entrance from the product ordering panel. No replacement AI imagery. The Curated Barbershop source is 344,934 bytes; its 240px companion is 16,128 bytes and 480px companion 56,266 bytes. A local 390px browser check selected the 240px image for the small card and retained the original real-photo appearance. Customer artwork/blob URLs retain their original preview flow.

Search and several form-only imports load on demand; the initial entry bundle is approximately 592.85 KB (192.47 KB gzip), previously 700.70 KB (211.18 KB gzip). Route-specific module preloads come from the fresh Vite manifest; unrelated admin chunks are excluded. These are build measurements, not a new live performance score.

Cart promo selection and the discount amount now resolve together, with a loading/error/retry state. Checkout quoting, payment controls and begin_checkout wait for promo readiness. A local 50-piece Matte 2x2 send-later cart showed $47.50 subtotal, AUTO10 -$4.75 and $42.75 total; removing/reapplying the code changed the total correctly. The controlled item was removed. No invoice, email or payment was generated. Cart product heading levels were corrected.

43 targeted promo/preload/analytics/checkout/QuickBooks/cart-edit tests passed, along with scoped lint, TypeScript, the 33-route prerender and local production build. Staged build dpl_5skcTNMiVRMPPmZbq3iFQVUSt4ZD failed closed: three 240px generated WebP hashes differed between local and remote output. Follow-up 6fa67a9 records image basename/dimensions/format alongside the snapshot and replaces a missing hash only if there is exactly one matching current asset. Two regression tests cover correct dimension matching and rejection of ambiguous/missing alternatives; local build passes. Failed deployment was never promoted.

Admin Settings → QuickBooks at approximately 09:30 PDT showed invoice 3275 still awaiting payment, $133.86 including $12.99 tax. Scheduled payment recovery reported its 09:16 run completed, with zero pending notifications/follow-ups/review items. This verifies the displayed state, not a successful purchase. GA4 stream G-4B9FXT1HQ9 showed recent collection, but Measurement Protocol secret creation required User Data Collection Acknowledgement; the user review request remains pending. No agreement was accepted and no secret created.

Implementation references: https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md and https://vite.dev/guide/backend-integration.html.

### Published result and measured limits — 09:36–09:40 PDT

Release **dpl_Ah9LeaFxJynL9tcfLLotjntTDYNr**, https://tssprint-is98e25u4-jordis-projects-94d2df39.vercel.app, containing 00cbfe0 + 6fa67a9, promoted successfully to tssprint.com. CLI upload began just before the 6fa67a9 commit completed, so deployed metadata may name its parent; uploaded files included the committed fix. Immediately before promotion the live alias still targeted dpl_FrL9gVRTV6xv11FyEV4SLYueWLHn. No later live release was replaced.

Staged browser confirmed loaded responsive signage cards, the original sticker material comparison, and a 50-piece send-later checkout with AUTO10 ($47.50 - $4.75 = $42.75 before tax). Payment remained disabled until customer details were supplied. Temporary staged item removed to Nothing to Checkout; no invoice/email/payment submitted. Chrome's viewport override did not take effect (1720px), so those checks count as desktop only. Live IAB verification did work: 382px document/scroll width at a 390px setting, responsive small assets loaded, legible two-column signage choices and sticky estimate action; sticker page also had no horizontal overflow. Overrides reset.

Public checkout-config still returned enabled=true, quickBooksOnly=true and the same eight mapped product categories. The newer tax-mapping commit df89084 shown in the user's Vercel failure email was not in this release; its failed attempts did not replace the working site. No claim that packaging/event product mapping is complete. Runtime error-filter sample returned one DEP0169 url.parse deprecation warning under staged cart/sync, not an established transaction failure. No drains inventory or full uptime claim.

Fresh Lighthouse 13.4.1 reports, one cold run per page, simulated Moto G Power/slow 4G, no CrUX data:

| Metric | Stickers mobile before → after | Signage mobile before → after | Stickers desktop before → after |
|---|---:|---:|---:|
| Performance | 68 → 71 | 69 → 72 | 95 → 96 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| FCP | 2.3 → 2.4 s | 2.3 → 2.4 s | 0.5 → 0.5 s |
| LCP | 6.2 → 6.0 s | 10.1 → 6.2 s | 1.5 → 1.4 s |
| TBT | 240 → 130 ms | 80 → 90 ms | 30 → 30 ms |
| CLS | 0 → 0 | 0 → 0 | 0 → 0 |
| Speed index | 4.4 → 4.5 s | 4.6 → 4.4 s | 0.7 → 0.7 s |

[Sticker report](https://pagespeed.web.dev/analysis/https-tssprint-com-stickers/1h4ye6lxbo?form_factor=mobile), [signage report](https://pagespeed.web.dev/analysis/https-tssprint-com-services-business-signage/7w1u5kfiug?form_factor=mobile). Estimated remaining mobile image savings fell from 263 KiB to 37 KiB on stickers and 937 KiB to 176 KiB on signage. These are Lighthouse estimates, not exact bytes saved for every customer.

Mobile performance remains incomplete. Sticker LCP is still the introductory H1, with 2,380ms raw element render delay in the trace; this differs from the simulated 6.0s LCP metric. Source inspection shows createRoot replacing prerendered DOM and an outer lazy-route Suspense blank fallback. This is a plausible remaining rendering cause, not isolated causal proof. Next performance work should test startup rendering/route readiness and unused main-bundle code; a hydration change needs compatible initial state and ordering/auth regression checks, not a blind createRoot-to-hydrateRoot swap. Do not add another photo redesign or claim 90+ mobile performance.

At the end of the pass GA4 no longer displayed its acknowledgement gate and Create was enabled, but no API secret existed. Prepared nickname “TSS verified purchases” and requested action-time confirmation to create/configure it; no secret created yet. Existing paid invoice/receipt reconciliation remains pending user financial action.
