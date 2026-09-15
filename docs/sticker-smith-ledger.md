# Sticker Smith ledger

Updated September 14, 2026 (Pacific). Canonical record for this customer experience pass.

## User decisions

- Review every public page and the buying flow, not just signage. Fix clarity, useful visuals and friction before adding decoration.
- Keep the intentional entry gate. Proofs are handled directly by email; no new customer approval portal.
- Prefer real shop/project photographs from the marketing Drive and suitable Instagram material. Label artwork and mockups accurately. Do not generate another video or force an unrelated image into a product example.
- Keep familiar abbreviations such as “pcs.” Explain the actual ordering distinction when sheets or rolls can be misunderstood.
- Use restrained entrances, image transitions and existing printer footage where they help. Respect reduced motion and keep payment forms steady.
- The separate task “Address preview readiness gaps” owns Intuit. This pass must preserve its changes and cannot claim payment readiness from visual checks.

## Audit scope and changes

Live text and customer navigation reviewed before edits: home, stickers, services, vehicle graphics, signage, event displays, business print, mylar, about, contact, quote, projects, referral, order help, account/recovery, empty cart/checkout/confirmation; all five sticker landing pages; all eight city pages; all three project stories. Mobile and completed-change verification are being recorded below as they run.

| Page or group | Finding | Change / remaining verification |
| --- | --- | --- |
| Home | Existing movement and printer video; review quotations have no source record | Keep useful movement; replace unsupported quotations with a direct Google reviews link and real work |
| Stickers + die-cut, sheets, rolls, holographic, labels | Real finish comparison exists; sheet and machine-roll scope needs explanation | Explain total sticker/label quantity, backing-sheet layout and machine requirements |
| Services | Choices buried below process video; blanket in-house claim conflicts with catalog | Put service choices first; accurate production wording |
| Business signage | Blank artwork panel before any examples | Real visual category chooser, selected example and scope guidance before optional artwork |
| Event displays | Little visual explanation; hardware scope ambiguous | Real booth photograph, clearly labeled design mockup, distinguish graphic-only and frame options |
| Business print | Empty artwork first; finish and subtotal unclear | Actual printed-card example and labeled flyer artwork; explain upgrades and print-run subtotal |
| Vehicle graphics | Empty upload panel; internal sales wording | Actual truck/installation photographs and coverage guidance before optional upload |
| Mylar | Blank simulated pouch; preview tabs do not select product; foil can appear free | Real packaging example first; tie preview to order; one paid foil option; quantity validation |
| About | Unsupported counts, stock and turnaround promises | Use supported project imagery and qualified product-specific timing |
| Projects + 3 project stories | Direct project URLs return 404; unsupported timing, materials and ROI claims | Prerender project routes; describe what actual photographs show |
| 8 city pages | Conflicting minimums, delivery, walk-in and rush claims | Consistent pickup-by-appointment, ready notice, quote-specific delivery; real Hayward shop image |
| Contact / quote / service estimates | Required service fields bypass native validation; selected scope asked twice | Restore validation and carry selected product into quote |
| Referral | Instant codes and statistics stored only in this browser | Replace false account promise with shop-confirmed referral request; durable referral automation remains pending |
| Account / recovery | Reset form visible and reachable | Email delivery not proven by UI check |
| Cart / checkout / confirmation | Need repeated customer edit/removal and guarded checkout check | No purchase or Intuit payment certification in this pass |
| Order help | Direct email proof instructions are appropriate | Preserve; formal policy drafts remain separately tracked |

## Evidence and boundaries

- Baseline audit: `../../../outputs/tssprint-customer-audit-2026-09-08.md` (historical customer score approximately 6/10).
- Asset provenance: [marketing Drive](asset-sources/marketing-drive-2026-09-14.md), [material photographs](asset-sources/material-photographs-2026-09-14.md). Existing online reference photo permissions still need business review; source attribution is not a license.
- The historical tracking score of 3/10 is not changed by this visual pass. GA4 event receipt, ad attribution, abandoned-cart email delivery and completed payment reconciliation need separate evidence.
- No fabricated reviews, exact production stock, turnaround statistics or sales outcomes should be restored without evidence.

## Release verification

See [the full page review and scores](customer-page-review-2026-09-14.md).

- Build: TypeScript + Vite production build succeeded; public routes and app shells generated. Three case-study routes added, plus a custom 404 document.
- Tests: 36 passed (8 pricing, 10 cart, 18 checkout/analytics). No purchase submitted.
- Lint: zero errors; one pre-existing Admin useEffect dependency warning in the separate payment/admin work.
- Browser: main templates at 390 px, eleven product/request routes at 320 px, desktop home and signage at 1365 px. Real mobile overflow in the label configurator fixed by containing the grid and preview.
- Customer interactions: selected signage → quote, incomplete event-form validation, charged foil upgrade and invalid quantity, sticker cart edit without duplication, checkout removal/empty state.
- Reduced motion: MotionConfig honors user preference, CSS animations/transitions stop, logo marquee offers pause and a stationary reduced-motion layout. No operating-system preference was changed for this test.
- Local test cart was emptied. Local Vite server lacks serverless APIs; no conclusion about production payments or recovery email delivery drawn from its API warnings.

Release uses the other task's committed `5ebcfef` Intuit work as its base. Its later uncommitted admin/payment work is preserved in its own checkout; integration must retain both sets of changes.

### Image classification correction

The Elevated 925 snack pack asset is promotional composite artwork, not a photograph of finished packaging. Candy Shock and Atomic Shock images are design mockups. Mylar now leads with explicitly labeled owner-supplied Olive Land artwork. A matched real pouch/finish photo set remains a gap; do not claim these graphics are photographs.

Project gallery corrections: Safeway vehicle-door install was incorrectly categorized as in-store signage; Bhogal photo shows truck-cab lettering rather than the previously claimed full box-truck wrap. Corrected both and removed unsupported fleet counts, stock models and packaging-certification descriptions in those entries.
