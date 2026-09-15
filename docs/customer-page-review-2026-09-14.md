# Customer page review — September 14, 2026

This is a customer-facing review of the whole public site. Scores are editorial judgments of clarity, useful imagery and the next step, not conversion measurements. The initial summary of this pass was **about 7/10 overall / 7.5/10 for marketing and product pages**. After recovering the September 8 rubric, the comparable September 14 customer-interface score is **7.6/10**, versus **5.75/10 originally** and **7.35/10 for the September 8 preview**. The earlier rounded summary was not a calculation using the historical weights and must not be read as evidence that the site deteriorated. See the [ledger's dated scoring history and common rubric](sticker-smith-ledger.md#dated-score-history-and-comparable-rubric).

Completed payments, recovery email delivery and measured tracking remain separate gates. The historical **3/10 live tracking score and 5.6/10 prepared tracking implementation score are historical assessments, not fresh September 14 measurements**. This page pass does not re-certify that system or override later operational evidence from the Intuit/tracking task.

## Every public page

| Page | Current assessment | Main finding / next step |
| --- | --- | --- |
| Home `/` | 8/10 | Clear sticker entry, real production clip, real project tiles on mobile. Keep the intentional gate. Video has controls; the logo strip can pause. |
| Stickers `/stickers` | 8/10 | Price, size, quantity, finish references and artwork choice are accessible. Cart edit works. Need matched photographs of the shop's exact stocked materials. |
| Die-cut `/die-cut-stickers` | 8/10 | Correct individual-sticker configurator; same price and artwork flow. |
| Sheets `/sticker-sheets` | 6.5/10 | Quantity now explicitly counts stickers. Fixed multi-design sheet layouts should be quoted; the current single-artwork preview is not a complete multi-design editor. Need a finished sheet photograph. |
| Roll labels `/roll-labels` | 7/10 | Fixed mobile clipping; quantity is label count. Machine core/unwind requirements need a quote before ordering. |
| Holographic `/holographic-stickers` | 8/10 | Correct finish preselection and actual holographic work/reference imagery. |
| Product labels `/custom-labels` | 7.5/10 | Correct roll starting point; fixed the same clipped mobile controls. |
| Services `/services` | 8/10 | Service choices now precede process video. Actual vehicle and event photographs replace generic category imagery. |
| Signage `/services/business-signage` | 8/10 | Four visual product choices, useful selected example, scope explanation and quote handoff. Interior glass photo is accurately labeled; a finished wall mural photo would improve this further. |
| Events `/services/event-displays` | 7.5/10 | Real canopy/banner setup plus labeled event mockup. Frame versus graphic-only and accessories are clearer. Still need finished backdrop/table-cover photographs. |
| Business print `/services/business-print` | 7.5/10 | Actual printed cards, labeled flyer artwork and simple format illustrations. Clear subtotal and finish explanations. Need confirmed paper weights/base finishes and photographs of postcards/magnets. |
| Vehicles `/services/vehicle-graphics` | 8/10 | Real vehicle/installation photos before upload, clear coverage and project-specific estimate. No unsupported stock guarantees. |
| Packaging `/mylar` | 6.5/10 | Owner-supplied artwork replaces empty placeholder. Product and preview agree; foil has one charged option and invalid quantity is blocked. Physical pouch/finish photographs and exact base print-method specifications remain needed. |
| Projects `/projects` | 8/10 | Useful named work and filters. Keep clearly separating finished work, artwork and mockups. |
| Safeway `/case-studies/safeway-fleet-graphics` | 7.5/10 | Direct URL now generated for deployment. Removed unverified fleet count, material model, timing and rating. Actual truck and door-install photographs remain. |
| Bhogal `/case-studies/bhogal-construction-truck-wrap` | 7.5/10 | Actual truck branding described without fabricated lead/ROI and full-wrap claims. Historical slug retained for existing links. |
| Atlas Pizza `/case-studies/atlas-pizza-storefront` | 7.5/10 | Storefront/A-frame project, without invented install timing or customer-traffic results. |
| About `/about` | 7.5/10 | Actual shop and print images. Removed unsupported project count and blanket material promises. A real owner/team introduction would make it more personal. |
| Contact `/contact` | 8/10 | Straightforward request form with actual shop image. No purchase required. |
| Quote `/quote` | 8/10 | Shorter quote-oriented entry; correct page-specific copy. |
| Referral `/referral` | 6.5/10 | Honest shop-confirmed request instead of browser-only codes and apparent earnings. Durable code generation, conversion tracking and payout workflow still need implementation. |
| Help `/order-help` | 8/10 | Direct proof-by-email instructions and pickup guidance. Formal policy drafts need business review separately. |
| Account `/account` | 7/10 | Login/recovery entry readable. Referral tab no longer presents local browser data as verified earnings. Delivery of password-reset email and signed-in order history not certified by this public UI pass. |
| Cart `/cart` | 7.5/10 | Sticker edit preserves one item and updates finish/quantity/price. Batch versus pieces clear. Secondary products can change batches or be removed; a full saved-configuration editor for every product is a remaining improvement. |
| Checkout `/checkout` | 7/10 UI only | Order summary, edit/remove and pickup choice are readable. Empty cart guard works. No payment was submitted; Intuit and provider readiness belong to the separate task. |
| Confirmation `/order-confirmation` | 7.5/10 fallback | Missing-reference state sends customers to their order history. Paid confirmation/email reconciliation requires a completed payment test. |
| Hayward `/hayward` | 7.5/10 | Actual shop photograph, appointment pickup, consistent minimum/timing. Removed unsupported walk-in and same-day promises. |
| Oakland `/oakland` | 7.5/10 | Service-specific request handoff; removed “no hard minimum” contradiction. |
| San Leandro `/san-leandro` | 7.5/10 | Real Hayward location and quote-specific installation/delivery availability. |
| Castro Valley `/castro-valley` | 7.5/10 | Same accurate pickup and project inquiry model. |
| Union City `/union-city` | 7.5/10 | Clear print options, real shop location and project-prefilled request. |
| Fremont `/fremont` | 7.5/10 | Removed unsupported compliance and delivery promises. |
| San Lorenzo `/san-lorenzo` | 7.5/10 | Removed inconsistent minimums and unsupported delivery claims. |
| Newark `/newark` | 7.5/10 | Clear local project inquiry without unsupported compliance claims. |
| Missing page `/404` | Recovery page | Friendly return-to-products links, actual sticker image, no internal “route” wording. Generated static error document for hosting. |

## Movement decisions

Existing short entrances and scroll reveals already cover the marketing pages. Added a small selected-product transition and site-wide reduced-motion handling. Home and Services retain the existing real printer video, with native playback controls. Brand logos have pause/play and a stationary wrapped layout for reduced motion. Cart, checkout, recovery and request forms remain steady. No new AI video was generated.

## Verified in this pass

- Read the public pages listed above before editing, including each of the eight cities and three project stories.
- Browser checked updated templates at 390×844; checked shared product/quote controls at 320×740. The label configurator had a genuine minimum-width overflow; after the fix, no clipped form controls were found in 11 narrow-screen product/request routes.
- Inspected desktop home and signage at 1365×900. Product category click updates the example and selected pricing options.
- Signage quote receives selected product and price without requiring a second product selection.
- Event form blocks missing display type/event date using native validation. No request was submitted.
- Packaging foil: 250 × ($1.25 + $0.30) = $387.50. Choosing matte removes foil and returns to $312.50. Fractional quantity is rejected before add-to-cart. Jar selection clears pouch upgrades.
- Sticker cart: 50 matte ($47.50) → edit to 100 gloss ($62.00), still one line item; 10% discount gives $55.80. Removal from checkout returns to the empty state. The disposable test item was removed.
- 36 pricing/cart/checkout/analytics tests passed. These use test fixtures; they do not prove live tracking receipt or email delivery.
- Production build/prerender and lint results recorded in the ledger. The local Vite UI has no serverless API runtime, so local cart-sync/payment-unavailable messages are not evidence that live production is failing.

## What still merits work

1. Finish and verify real payment/provider setup, then paid order → confirmation → admin → invoice/reconciliation → customer email. Do not call Apple Pay/PayPal/Intuit ready from a logo or button alone.
2. Check real GA4/ad-platform event receipt, consent, source attribution and abandoned-cart delivery with identifiable test evidence.
3. Confirm exact paper stocks, base packaging print method, material availability and product-specific lead times; obtain matched finished-product photos where the ledger identifies gaps.
4. Implement durable referrals before restoring instant codes/earnings, and a full configuration editor for non-sticker cart items.
5. Review the existing policy drafts with the business owner and publish the approved terms/privacy language.

These are explicit follow-ups, not claims that the audit is complete end to end at the payment or business-operations layer.
