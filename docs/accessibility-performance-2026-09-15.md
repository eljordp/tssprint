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
