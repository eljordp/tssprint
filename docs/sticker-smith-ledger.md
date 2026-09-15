# Sticker Smith ledger

Updated September 14, 2026 (Pacific). Canonical record of customer-experience decisions, dated audits, useful research and verification. Retain important findings and their source/version, not transcripts, credentials, customer records or repetitive tool logs. Preserve earlier ratings as history and mark corrections explicitly.

**Active next-work plan:** [Cart editing, material evidence and order/recovery verification](customer-next-steps-plan-2026-09-14.md), created September 14 at 21:09 PDT at the user's request. Proposed sequence with ownership and acceptance criteria; no implementation or deployment performed in the planning turn.

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

## Dated score history and comparable rubric

Consolidated September 14, 2026, approximately 21:05 PDT. Source dates below are the dates recorded in the original artifacts. Chat timestamps refer to the start of the retrieved turn, not an invented exact completion time.

| Assessment | Date / source | Score and environment | Interpretation |
| --- | --- | --- | --- |
| Original customer audit and follow-up plan | September 8; original audit + improvement plan | 5.75/10, rounded to 6/10; then-live site | Weighted editorial customer-readiness assessment. Entry gate retained as an owner constraint. |
| First customer fixes | September 8; local preview report, thread turn started 17:02 PDT | 7.35/10, rounded to 7.4/10; local preview | Same customer weights. Tested example improved from 9 actions / 4 pages to 6 actions / 3 pages before checkout form/payment. This is one specified journey, not a universal step count. |
| Expanded original 21-finding audit | September 8; expanded rescore, turn started 18:49 PDT | Customer 7.4; prepared tracking implementation 5.6; then-live tracking retained around 3 | Separate scopes. Engineering and fixture tests did not prove live delivery or collection. |
| Cross-task handoff | September 14, 16:44 PDT; first turn of “Address preview readiness gaps” | Repeats the September 8 expanded scorecard | Historical handoff, not an independent fresh rating. |
| First summary of full-page pass | September 14; current page review before rubric reconciliation | Roughly 7 overall / 7.5 marketing and product pages | Qualitative summary with broader operational caveats, not the earlier weighted calculation. Superseded for numerical comparisons by the next row. |
| Full-page pass, reconciled rubric | September 14, 21:05 PDT; customer changes d6e7efd, combined release fc4b0ed | **7.6/10 customer interface** | Current reviewer assessment using the original weights. Actual payments, email delivery, full accessibility and business results are separate verification items. |

The numerical precision is arithmetic, not scientific accuracy. These are reviewer-assigned scores; a small decimal difference is not proof of customer improvement. Broken routes, incorrect totals and clipped controls are testable findings; taste, ease and image persuasiveness involve judgment. No percentage split between “objective” and “subjective” has been measured.

| Dimension | Weight | Original Sept 8 | Sept 8 preview | Sept 14 interface | Basis for current judgment |
| --- | ---: | ---: | ---: | ---: | --- |
| Visual identity / work presentation | 15% | 8 | 8 | 8 | Real project evidence and consistent service visuals; some exact product photos remain missing. |
| Discovery / selection | 20% | 5 | 7.5 | 8 | Visual service choices, preserved product intent, explicit scope and project inquiry context. |
| Price / material confidence | 20% | 4 | 6.5 | 7 | Price and upgrade behavior checked; exact shop stocks, paper weights and matched finish photos remain incomplete. |
| Cart / checkout interface | 15% | 7 | 8 | 7.5 | Sticker editing, totals and removal checked; wider product review exposes missing full configuration editing for secondary products. No paid-flow score implied. |
| Trust / support clarity | 15% | 6 | 7 | 7.5 | Removed unsupported claims, retained real work and direct email help; complete business-approved policies remain pending. |
| Mobile / basic accessibility | 10% | 6 | 8 | 8 | Responsive checks at 320/390 px, named controls and reduced-motion implementation. Full conformance and real-device speed remain unscored. |
| Account / return / recovery interface | 5% | 4 | 6 | 7 | Visible password recovery and honest referral request. Actual reset delivery and durable referral operations are not certified here. |
| **Weighted customer score** | **100%** | **5.75** | **7.35** | **7.60** | Compare the same dimensions; do not average the separate product-page scores into this again. |

### Other historical scores worth preserving

These are September 8 preview findings recovered from the expanded rescore, not current claims that later repairs are still broken: sticker price presentation **8.5**, imagery/material evidence **6.5**, quote/lead handling **6**, artwork across products **5**, policies/timing **5.5**, post-purchase clarity **4**, server price/promo enforcement **4**, SEO foundations **6**. The payment/tracking task subsequently reported deployed server enforcement checks; do not keep calling the old price-validation vulnerability a current verified defect without retesting.

Prepared tracking implementation weights were events/funnel 20% × 7; cart identity/persistence 20% × 6; attribution/exclusion 10% × 6; payment linkage 20% × 5; recovery/email 20% × 4; reporting/failure visibility 10% × 6 = **5.6/10**. There were no measured historical component scores to backfill for the original approximate 3/10. Performance/CWV, full accessibility, and actual fulfillment/support were unscored and remain unscored by this public-page pass.

All current individual page ratings and specific remaining gaps are in the [September 14 page review](customer-page-review-2026-09-14.md). No separate old per-page numbers were recovered from the earlier scorecards; those contain category scores. Do not invent a before score for every page.

Historical source artifacts (preserved in the original task outputs):

- [Original customer audit](/Users/admin/Documents/Codex/2026-09-08/how/outputs/tssprint-customer-audit-2026-09-08.md): original 21 findings.
- [Accepted improvement plan](/Users/admin/Documents/Codex/2026-09-08/how/outputs/tssprint-improvement-plan-2026-09-08.md): owner constraints, weights, pricing discontinuity and tracking investigation.
- [First fixes and test evidence](/Users/admin/Documents/Codex/2026-09-08/how/outputs/tssprint-customer-fixes-preview.md): 18 tests and specified 6-action journey.
- [Expanded rescore](/Users/admin/Documents/Codex/2026-09-08/how/outputs/tssprint-expanded-rescore.md): headline/category/tracking scores and original-finding status.
- [September 14 imagery/cart release](/Users/admin/Documents/Codex/2026-09-08/how/outputs/tssprint-customer-finish.md): prior deployed 5fc8ee8, asset classification and verified staged cart exercise.
- Source tasks: “Review tssprint.com customer view” (`01a08351-7f47-74d1-a195-424ddb1cf8da`) and “Address preview readiness gaps” (`01a0a24f-078b-7a80-a884-c78c8ef65513`). Earlier speculative Supabase ownership theories are not treated as established facts here.

## Font and competitor benchmark — September 14, 2026

Researched approximately 20:55–21:05 PDT. Primary pages opened, with rendered browser inspection. This is a focused comparison of material explanation and entry-to-order presentation, not a completed purchase or audit of every competitor page, product quality, customer service or conversion rate. Competitor material/durability statements are their own claims; they do not establish TSS stock specifications. Prices were not used to declare a best-value printer.

| Site / inspected source | Typeface evidence | Useful benchmark for TSS |
| --- | --- | --- |
| TSS [stickers](https://tssprint.com/stickers) | Source `src/index.css` imports Noto Sans 400/500/600/700/900; body uses Noto Sans with system fallback; headings default to 900. This is configured typography, not proof that every browser loads the webfont. | Keep this family. Current identity is readable and fits the print business. Improve hierarchy and supporting text before replacing it. |
| [StickerApp material guide](https://stickerapp.com/materials) | Computed styles on inspected heading/body: Noto Sans, Helvetica, Arial, sans-serif; heading 900. | Same main family as TSS. Consistent material choices, use explanations and physical sample-pack route make comparison easier. Illustrative swatches are not necessarily product photographs. |
| [Sticker Mule die-cut page](https://www.stickermule.com/products/die-cut-stickers) | Heading declares proxima-nova; body Helvetica Neue / Helvetica / Arial / sans-serif. | Compact size → quantity/price → upload progression, clear next-step label and proof/delivery explanation. TSS can learn from the ordering hierarchy without copying its identity. |
| [StickerGiant custom stickers](https://www.stickergiant.com/custom-sticker-printing) | Encode Sans Condensed heading, weight 800; Inter body. | Paired same-design matte/gloss images plus material, adhesive, care and use specifications. More choice creates a longer configurator; this is not proof that every part is simpler. |
| [VistaPrint rigid signs](https://www.vistaprint.com/signs-posters/rigid-signs) | Graphik heading/body; heading 700. | Material comparisons, “best for” uses and relevant accessories help customers choose signage. Large catalog/navigation is not something TSS needs to duplicate. |

Computed styles show declared font stacks, not a low-level rendered-glyph audit. The main TSS font is **Noto Sans**, so calling the whole site “Arial” is inaccurate. Arial/system fallbacks may appear where a webfont fails to load. Recommendation: retain Noto Sans; ordinary body text at 400, labels at 600/700, heavy headings used selectively. Review phone body size, contrast, line length and spacing, and verify a direct checkout load uses consistent fonts before adding another font dependency. No font swap was made for this comparison.

### What would justify approaching 10/10

The goal is excellent completion of this shop's actual customer tasks, not a universal design award or copying a national printer's entire catalog. A new video or proof portal is not a requirement. Direct email approval can be excellent if the process is clear and reliable.

1. **Product confidence:** each orderable product has an accurate representative photo or honestly labeled illustration, confirmed stock/finish, quantity unit, included hardware/printing, price and relevant delivery/approval expectations. Priority photo gaps: actual matching material set, sheets, pouches, postcards/magnets, backdrop/table cover.
2. **Complete order control:** editing every supported product preserves its configuration, artwork and price; shipping/pickup, discounts, validation and retry states work without duplicates or lost work. No blank or misleading preview is needed to choose a service.
3. **Verified service outcomes:** controlled orders establish payment → correct itemized order/invoice → receipt → artwork/proof communication → pickup/shipping status. Cart-email restore and password reset reach the intended test inbox and work. Provider acceptance alone is not delivery.
4. **Measured access and speed:** keyboard/focus, screen-reader forms, contrast/zoom, reduced motion, real phones and slow-network loading; record measurements and fix actual failures. Do not fabricate Lighthouse/CWV results.
5. **Independent customer evidence:** as a next validation exercise, observe at least five first-time buyers attempting representative sticker and service tasks without coaching. Record task completion, confusion, wrong choices, time and error recovery. This small sample finds issues; it is not statistically conclusive conversion evidence. Use reliable live funnel/error and support data over time before claiming conversion improvement.

Keep the existing rubric and explain score changes with evidence. Mark the release version, date, environment and verification boundaries every time. Competitor comparison is a source of specific improvements, not a claim that their entire business is better.

## Release coordination — September 14, 2026

Customer changes committed as `d6e7efd`, based on `5ebcfef`. Separate attempted production artifact `dpl_3S2EfEsVN7h7vvivZ49xTRfboSvP` was BLOCKED because Vercel did not authorize its inherited commit author; it was not promoted and no access permissions were changed.

The Intuit/admin task merged customer changes in `b7e8d5d`, then produced combined commit `fc4b0ed`. Combined artifact: [tssprint-ca3r7bb8c](https://tssprint-ca3r7bb8c-jordis-projects-94d2df39.vercel.app), deployment `dpl_5QExPMWTvy3jtueqygxLQvzhvzfE`. At approximately 21:03 PDT, `vercel inspect https://tssprint.com` resolved to that READY production artifact. Public route/browser checks are recorded below once complete. Never deploy the older customer branch over the combined admin/payment release.

Public verification, September 14 evening, following the approximately 21:03 PDT production-alias check:

- All **31 public routes returned HTTP 200** with their expected page content/headings, including all three formerly broken case-study URLs. Cart, checkout, account and confirmation app shells also returned 200 with their route-specific titles; shell HTML alone does not prove their complete workflows.
- A deliberately nonexistent page returned **HTTP 404 with the custom recovery page**. The explicit `/404` document returned 200, as a directly requested document.
- Five legacy links returned **308 to the intended replacement**: `/order`, `/case-studies`, `/services/window-film`, `/services/event-canopies`, `/services/mylar-packaging`.
- Live desktop signage visibly shows all four real-photo category choices. Selecting Atlas Pizza A-frame changes the selected image, description, size choices and $169 starting estimate together. This is the combined production build, not the local preview. The broader 320/390 px and cart checks above were performed locally before release; do not mislabel those as new production payment tests.
- No order, purchase, customer message or new reminder automation was submitted by this public-page verification.

The user requested a return to the original page work after the historical/font research. Research is complete for now; retain Noto Sans. Prioritize remaining product evidence, complete cart editing, and independently verified customer outcomes over further font exploration.
