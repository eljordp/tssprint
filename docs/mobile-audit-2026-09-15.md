# Mobile audit — September 15, 2026

Updated 10:30 PDT. Work continues from the approved customer improvement plan. Preserve Cal’s visible sticker shape/material/quantity choices, matching material references, Noto Sans, the desktop entry gate and direct emailed proof approval. The 602-file Drive review stays deferred.

## Verified findings and changes

- Fresh slow-4G lab baseline at 09:52: stickers **70**, home **73**. Signage earlier at 09:37: **72**. These are Lighthouse performance scores, not customer experience ratings or field Core Web Vitals.
- First release `9204428`, deployment `dpl_5zkJKUPK6ry4CMcUeEtGaWyWfsAB`, promoted successfully: initial route is ready before React mounts; first-screen text/images no longer start hidden for entrance animations; homepage poster uses responsive image variants; Supabase pricing/upload imports load when needed.
- First-release 10:17 measurements: stickers **72**, home **74**, signage **87**. LCP respectively **6.1 / 5.7 / 3.6 seconds**. Accessibility, best practices and SEO each **100** in these automated reports. Small sticker/home improvements were insufficient; additional work was required.
- Remaining sticker LCP was the hero image: 190ms resource delay, 210ms load duration, 1,940ms raw render delay. Replacing prerendered content on React startup was still recreating visible content.
- Follow-up `5f0c816` generates genuine React server-rendered markup and hydration markers for home, stickers and signage during prerender. First visits hydrate that markup. Personalized query options, saved carts and cached pricing keep the established client-render path so configurations are not overwritten with public defaults. This is limited to those three tested entry pages. Other public pages retain their existing prerender plus route-ready mounting.
- Local home/sticker and Vercel signage hydration checks: no recorded React warnings/errors; material/category changes worked. Full build and responsive asset rewriting passed. This does not establish a new performance score until the published build is measured.
- Search failed for “signs.” `667bce7` adds plural/multiword matching, a direct Sticker Sheets result and conservative typo matching. Tests cover “stikcers,” “buisness cards,” “holograhpic,” “roll lables,” and “singage”; numeric dimensions are not fuzzy matched. Direct matches rank ahead of typo matches. Search input fits narrow screens and close control is 44px.
- Quote fields used 15px text; some custom quantity fields used 14px. The follow-up makes these 16px, matching customer checkout fields.

## Route and interaction coverage

Browser viewport checks at 390px (382px content width including scrollbar); 320px (312px content width) for sticker configuration, upload, cart and checkout. These are browser emulations, not physical iPhone/Android testing.

All 36 routes below produced the expected heading and no horizontal document overflow. No broken **loaded** images were found. Offscreen lazy images were not classified as broken merely because they had not loaded. Initial blank reads were repeated only after the expected heading appeared.

| Group | Routes |
| --- | --- |
| Main | `/`, `/stickers`, `/services`, `/projects`, `/about`, `/contact`, `/quote` |
| Services | `/services/business-signage`, `/services/business-print`, `/services/event-displays`, `/services/vehicle-graphics`, `/mylar` |
| Sticker formats | `/sticker-sheets`, `/roll-labels`, `/die-cut-stickers`, `/holographic-stickers`, `/custom-labels` |
| Support | `/order-help`, `/referral`, `/terms`, `/privacy`, `/404` |
| Cities | `/hayward`, `/oakland`, `/san-leandro`, `/castro-valley`, `/union-city`, `/fremont`, `/san-lorenzo`, `/newark` |
| Case studies | `/case-studies/atlas-pizza-storefront`, `/case-studies/safeway-fleet-graphics`, `/case-studies/bhogal-construction-truck-wrap` |
| Customer account/order | `/cart`, `/checkout`, `/account` |

Additional checks:

- At 320px: format/shape/material controls readable, sticky action stays within width; PDF first-page preview and page count appear; replacing it with PNG saves and previews the new image.
- Cart edit reopens saved PNG preview. Updating 50 to 100 pieces preserves one line and artwork; $47.50→$62.00 base, automatic discount $4.75→$6.20, cart total $42.75→$55.80. Restored to 50 pieces for the controlled payment test.
- Checkout shows editable/removable line item, explicit total before tax, pickup removes shipping address fields, contact inputs are 16px. Invoice review adds actual tax before the external payment page.
- Mobile menu opens and Escape closes it; search opens with focus and results remain under review after its fix.
- Empty contact form identifies missing name/email/message without sending a quote.
- Lower-page checks: signage, event displays, packaging, projects, about and order help retain footer links with no horizontal overflow or broken loaded images. Shared quote-field sizing issue recorded and corrected. Representative business-print options, quantity and summary reviewed.
- Full physical keyboard/VoiceOver, every quote submission, every material/size combination and every photo in the library are not claimed tested. Existing speculative material specifications remain unknown rather than invented.

## GA4, tax and paid receipt test

- **Correction to the earlier release note:** newer QuickBooks tax mappings are now included. The live production configuration and admin expose the taxable Website Mylar Packaging, Website Canopies and Website Table Covers mappings. Preserve the original accounting records.
- Created the GA4 Measurement Protocol credential “TSS verified purchases” in the existing TSS stream and saved it as sensitive `GA4_API_SECRET` in Vercel Production. No credential values are recorded here. Published release activates it.
- Verified live at **Admin → Settings → QuickBooks → Check payment settings → GA4 purchase tracking**: “Server configured · verify a paid transaction in GA4.” Configuration readiness is not proof that Google recorded a purchase.
- Explicit `analytics_debug=1` purchase tests carry GA4 `debug_mode` and `traffic_type: internal`; normal staff browsing stays suppressed. GA4 filters were previously in Testing, so do not assume internal test traffic is removed from all reports.
- Prepared **invoice 3277**, checkout ID `c64e1f0b-4159-4bac-8fa8-ac2574ce5b4f`, to the authorized test inbox **eljordp@gmail.com**. Legitimate 50 matte 2×2 stickers, pickup; $47.50 subtotal − $4.75 discount + $4.60 tax = **$47.35**. Website and Intuit totals agree. Debit, credit and Apple Pay visible on Intuit.
- Status at 10:20: **awaiting payment**. No paid order, receipt delivery or GA4 purchase is claimed. Browser payment handoff was requested; invoice tab is prepared for the user. Other invoices were not modified.
- Admin verification path: Settings → QuickBooks → Load invoices; after payment use Check due payments & retry follow-ups and inspect the corresponding order. Email accepted is provider acceptance, not inbox delivery. Verify the receipt in the authorized inbox and the purchase in GA4 before closing the task.

## Evidence

- [09:52 stickers baseline](https://pagespeed.web.dev/analysis/https-tssprint-com-stickers/zcze65wvu2?form_factor=mobile)
- [09:52 home baseline](https://pagespeed.web.dev/analysis/https-tssprint-com/m9543cw4e7?form_factor=mobile)
- [09:37 signage baseline](https://pagespeed.web.dev/analysis/https-tssprint-com-services-business-signage/7w1u5kfiug?form_factor=mobile)
- 40 initial targeted tests passed; later 23 startup/artwork/payment regression tests and 3 search tests passed. TypeScript, scoped lint and production builds passed. Counts overlap and are not additive unique test coverage.
- React documents the difference between [creating a root](https://react.dev/reference/react-dom/client/createRoot) and [hydrating server-rendered content](https://react.dev/reference/react-dom/client/hydrateRoot). The hydration follow-up uses React’s own generated markup; it does not try to hydrate arbitrary mounted-DOM snapshots.
