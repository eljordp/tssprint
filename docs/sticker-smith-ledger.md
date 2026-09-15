# Sticker Smith ledger

Updated September 14, 2026 (Pacific). Canonical record of customer-experience decisions, dated audits, useful research and verification. Retain important findings and their source/version, not transcripts, credentials, customer records or repetitive tool logs. Preserve earlier ratings as history and mark corrections explicitly.

## Current plan, tracking and clarity assessment — September 14, 22:24 PDT

User explicitly deferred reviewing all 602 Drive entries; preserve inventory for later. Updated the existing [completion plan](customer-next-steps-plan-2026-09-14.md#current-completion-plan--september-14-2224-pdt), covering formats, accurate funnel reporting, copy/product evidence, upload/recovery/admin tests, payment and final device/release checks. Planning only; no app edits, payments, emails or new asset review. No routine contact with the other task.

Live `/stickers` DOM and screenshot: Individual/Sheets/Rolls are present but visually secondary preview-like pills. Sheets retains individual sticker-count pricing and a quote link for multi-design sheets. Dedicated sheet landing copy promises multiple designs and initializes a different cut from switching formats in the hub. Recommendation: retain useful dedicated landing URLs with the shared configurator, promote three clear format choices on the hub, reconcile actual product/price/unit semantics first. Do not delete useful search pages or invent per-sheet prices.

Tracking **6.0/10 provisional readiness judgment**, replacing use of historical ~3 as if current. This is not an end-to-end verified score or a measured reliability percentage. Historical weights retained: events/funnel 20%×8; cart identity/persistence 20%×7; attribution/exclusion 10%×6; payment linkage 20%×4; recovery/email 20%×5; reporting/failure visibility 10%×6 = 6.0. Based on previously recorded GA4 event receipt, persisted/editable carts, provider delivery and deployed queue visibility; incomplete purchase reconciliation, recovery completion, GA4 filter enforcement and reporting semantics constrain it. The September 8 prepared-code 5.6 score was a different evidence scope. Earlier decision to withhold a fresh verified operations score remains valid; this new provisional estimate is supplied at the user's explicit request.

New reporting finding in current `Admin.tsx`: page funnel counts independent sets, not temporally ordered cohort transitions; direct checkout skips cart, so “drop-off” wording overstates what the data proves. Upload branches are absent from this chart despite events in Tracking checks. Lead source breakdown takes limited rows whereas headline leads use exact count; verify/report completeness. Do not interpret confirmation views as paid conversion. See plan phase 2.

Admin organization **7.5/10 provisional**, based on current deployed code and recorded earlier authenticated checks: navigation/action finding 8 (40%), record workflow clarity 8 (30%), reporting clarity 6 (30%) = 7.4, rounded to nearest half-point. Eight work groups, attention queues, search, job details, source reporting and delivery-status/retry visibility improve organization. No comparable prior admin number was recorded, so do not invent a numeric before score. Fresh authenticated visual review was unavailable: both current IAB and Chrome Jordan profile showed Admin Login. No login credentials requested or entered. Operational reliability remains separately unverified.

Where to look after login:

| Task | Admin location |
| --- | --- |
| Revenue, leads, sources, page reach | Reports → Sales & traffic (`/admin?tab=analytics`) |
| Upload and checkout milestone timestamps; quote delivery queue; GA4/Resend links | Reports → Tracking checks (`/admin?tab=tracking`) |
| Inactive/paid cart records, recovery email state | Orders → Abandoned carts (`/admin?tab=carts`) |
| Payment state, order artwork, approval/production/pickup/shipping | Orders → Orders (`/admin?tab=orders`) |
| Saved quotes and follow-up | Quotes → Quotes & inquiries (`/admin?tab=inquiries`) |
| Search reporting | Reports → Search performance (`/admin?tab=seo`) |

Tracking checks reads the latest 500 matching site events; it is not GA4 delivery proof or lifetime totals. Inactive means 60 minutes without activity on a nonempty cart, not proven lost revenue. Ratings live in this ledger, not as admin score widgets.

Customer interface stays **7.75 (~7.8)/10**; this discovery adds unfinished work rather than an automatic rating increase. Current qualitative judgment: easier to browse, edit and retain artwork; still excess repetition in proof reassurance, local SEO copy and overlapping project blocks. Historical defined scenario improved 9→6 actions and 4→3 pages before checkout fields/payment; no new all-products click-count or completed purchase claimed. Upload happy paths have evidence; expired files, interruptions and all file/device combinations do not.

Primary sources opened September 14, approximately22:18–22:23PDT: [Google ecommerce navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure), [URL/variant canonical guidance](https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites), [StickerApp sheets](https://stickerapp.com/stickers/sticker-sheets), [StickerApp rolls](https://stickerapp.com/labels/labels-on-roll), [Sticker Mule die-cut](https://www.stickermule.com/products/die-cut-stickers). Google supports linked useful product/category pages and consistent URLs; it does not prove TSS traffic/ranking benefits. StickerApp separates sheet size/layout and roll-label products; Sticker Mule has a compact size/quantity/next-upload ordering hierarchy. Both have supporting content below ordering. Recommendation is to reduce repetition and clarify decision hierarchy, not indiscriminately remove text or copy competitor manufacturing claims. No exhaustive comparison with every competitor or Search Console performance audit.

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

## Approved cart plan shipped — September 14, 2026, 21:40 PDT

User approved implementation of the [next-steps plan](customer-next-steps-plan-2026-09-14.md). This entry records the first completed release and remaining dependencies; it does not claim every operational acceptance test is complete.

**Live release:** `6d95167`, including cart implementation `f34a656` and the other task's analytics `4d479fd` / contact-submit `ae3ab3b`. Artifact [tssprint-7cgh53fg4](https://tssprint-7cgh53fg4-jordis-projects-94d2df39.vercel.app), deployment `dpl_Av72JrmyMaNuyKsF8VLYhNUoBYpS`. Staged with production configuration without moving the main domain, then promoted after browser checks. `vercel inspect https://tssprint.com` confirmed READY on this artifact; coordination preserved the other task's admin/payment work.

### Customer changes and evidence

- Cart and checkout now edit saved business cards, flyers/door hangers, postcards, vehicle magnets and packaging. Versioned configuration uses existing catalog category/size keys; legacy carts are restored only when saved fields are unambiguous. Missing/unavailable configurations produce a recovery state. Sticker editing remains intact; quote-only services remain estimates.
- Save replaces the same line, keeps batch count and artwork, and recalculates selected catalog quantities/upgrades. Cancel leaves the original intact. Changing variants removes incompatible add-ons with an explanation. All-batch subtotal is explicit during editing.
- Packaging frontend product names now match the server's canonical names. Jar quantities use `pcs`; the product name specifies jars. Catalog minimums prevent quantities the server would reject.
- Local UI: all five families added/edited/saved; multi-item preservation, two-batch cards, canceled edits, minimum-quantity blocking, variant/add-on changes, and checkout-to-edit return passed. Phone 390px inspected. This local Vite server has no serverless API runtime; its unavailable online-cart warning was not a production defect.
- Staged actual storage upload: disposable `tss-cart-edit-test.svg` attached to card and pouch. Card 250/$65 → 500/$105; pouch 250/$312.50 → 500/$575, gloss/black retained. Save/reload preserved each attachment and one correct line; the other cart item stayed intact. Checkout showed subtotal $680, AUTO10 -$68, total $612. No contact details, email, quote or paid order submitted.
- Live phone: card 250/$65 → edit 500/$105 → save/reload retained one correct item and $94.50 discounted total. Test line items cleared from local, stage and live carts. Uploaded test objects were not paid orders or staff submissions. Temporary viewport reset.
- **50 relevant tests passed**, covering pricing, cart/recovery, product editing, checkout enforcement, analytics and contact-submit failure isolation. Lint passed; full build/prerender produced 31 public routes. Seven changed/adjacent live paths returned 200: business print, mylar, cart, checkout, stickers, signage, events. Routine HTTP checks do not imply payment completion.

### Comparable rescore

Customer-interface weighted score **7.60 → 7.75/10 (rounded 7.8)**. Keep all historical rubric weights. Cart/checkout rises **7.5 → 8.5** (15% weight) because the missing non-sticker editing path now works with retained options/artwork. All other dimensions are unchanged; no speed or conversion lift inferred. Current page judgments: business print **7.5 → 8**, packaging **6.5 → 7**, cart **7.5 → 8.5**, checkout interface **7 → 8**. Other page scores unchanged. Material gaps still constrain packaging; provider readiness remains separate. See the [updated page review](customer-page-review-2026-09-14.md).

### Operational evidence reported by the coordinating task

“Address preview readiness gaps” (`01a0a24f-078b-7a80-a884-c78c8ef65513`) reported this evening:

- Correct GA4 property `541419462`, stream `G-4B9FXT1HQ9`, received `artwork_upload_started`, `artwork_upload_succeeded`, `add_to_cart`, `begin_checkout` and `delivery_method_selected`. Explicit sanitized UTM changes shipped in this release. No purchase event or transaction reconciliation was claimed. Testing developer filter remains Testing; do not call all staff/test filtering fully enforced.
- Resend showed six existing controlled migration messages **Delivered**: customer/staff quote, customer/staff order, cart recovery and password reset. This is provider delivery evidence, not inbox-placement confirmation or proof that the recipient completed reset/restore. No duplicate emails sent this turn.
- Authenticated admin SQL checks passed notes save/readback, missing-proof rejection, approved-state transition, actor audit and non-admin privacy; test transactions rolled back. These are not a completed paid customer order or permission for live status notifications.
- Durable contact delivery queue work is separate and **not included** in `6d95167`. Do not describe it as deployed until that task supplies its own verified release.

Historical live tracking **~3/10** is not a current measurement. There is now observed event receipt and provider-delivery evidence, but a fresh numeric operations score would need the remaining purchase, recovery-completion, attribution, exclusion and failure-path checks. No invented new overall tracking number.

### Material follow-up and remaining dependencies

Targeted Drive/Instagram review is in the [source addendum](asset-sources/marketing-drive-2026-09-14.md#targeted-follow-up--september-14-approximately-21312139-pdt). Food Packaging's 19 listed files remain PDFs; no new physical pouch sample selected. Instagram's Olivia baby-shower image is real signage, not a printed table cover. **A real backdrop source now exists:** [Assam Convention installation](https://www.instagram.com/thestickersmith/p/DagSItHEvWb/), identified by the shop caption as an 8×10-foot project. The Drive folder remains empty, but saying no shop backdrop evidence exists would now be wrong. Browser media export failed; no new backdrop asset was published from that clip.

Shop questions are pending for base pouch print method and standard paper/sticker stock. Keep unconfirmed claims out of copy. Remaining actual-product images: matched stock/finish samples, printed pouch, multi-design sheet, postcard/magnet and printed table cover; an original Assam clip/still can cover the backdrop without a new shoot. No new generated product photos, font work, approval portal or promotional video.

Still unverified: controlled paid purchase and invoice/receipt reconciliation; actual inbox placement and cart/reset completion; live expired-artwork/network-error exercises; measured slow-network/real-device performance and full accessibility; business-approved policy details and fulfillment outcomes. These remain explicit plan checkpoints rather than silently marked complete.

## Operations release — September 14, approximately 21:56 PDT

Separate operations task released **84a330b**, deployment **dpl_8NQypvQjuu8cuWii3WHM4MoXE2go**, preserving customer release6d95167 and ledger911e042. New quotes atomically queue staff/customer email, customer sync and opt-in subscription separately. Private admin statuses/retry, leases, frozen idempotent email requests and unsubscribe preservation are live. Vercel Hobby daily backup is configured at14:00UTC; immediate dispatch handles ordinary submissions. Uncertain sends beyond23h stop for provider review. No historical quotes replayed or new test emails sent. New email approval is pending.

Preview/local domains now suppress ordinary customer analytics; explicit GA4 debug remains marked internal. Stage page verified zero GA4 loaders. Prior QA may exist in reports; GA4 filters remain Testing pending processed-label checks. Do not use that activity to rank services.

Live admin: all eight main sections loaded; Cmd-K/product search navigation worked; a no-change production-detail save/reload passed, invalid HTTP tracking URL was retained with Not saved, original value restored. Separate rollback SQL tests verified proof gating, audit and access isolation.

QuickBooks **sandbox** invoice1038: $65 cards + $25 soft-touch − $13.50 discount = **$76.50**. Hosted link returned, simulated payment reconciled, same invoice reused. This is no real card charge, settlement, invoice email, Apple Pay or public QuickBooks checkout proof. Intuit is signed out and needs user sign-in. Production assessment/policies/credentials, customer checkout/order linkage and bounded real transaction verification remain unfinished.

Validation:62 combined tests before final small additions, then21 targeted analytics/contact tests; build and targeted lint passed. Live empty retry action returned Checked0duejobs. Large-chunk warning remains; no measured speed/accessibility/conversion score added.

## Instagram backdrop photo — September 14, approximately 22:04–22:15 PDT

User approved suitable Instagram work. Added the real **Assam Convention installed backdrop** to the event selector, event gallery and [project detail](https://tssprint.com/projects?project=assam-convention-backdrop). This replaces the backdrop's unrelated OTAI design mockup; the table-cover mockup stays labeled. No generated imagery or new video was made.

Correction to earlier source limitation: the first carousel slide contains a 3024×4032 photograph, and browser export succeeded. The failed video export does not block this image anymore. Preserved original plus 1200×900 / 116,390-byte crop; [source and exact transformation](asset-sources/marketing-drive-2026-09-14.md#instagram-backdrop-photo-selected--september-14-approximately-22042211-pdt). Removed excess wall/floor, retained real folds/lighting, and kept the full print/frame visible in the phone project detail. Claims are limited to the shop's identified project; today's quote still confirms hardware and installation.

Application commit **7e54d3d**, based on latest operations/ledger **bc0d5e1**. Scoped lint and full31-route prerender passed. Local desktop/390px checks verified selector image, scope, correct category estimate and project-to-contact context without submitting a quote. Staged image loaded at1200×900 with contain-fit; no payment/admin logic changed. Deployment **dpl_FQN8TmJgjsfwMGSBY1KsRkoRxV5i**, [artifact](https://tssprint-zy4ylvbnf-jordis-projects-94d2df39.vercel.app). Live verification recorded below after promotion.

User working preference: focus on the current task. Do not send routine progress messages to the other task every time. Coordinate only when necessary to resolve an actual ownership conflict, dependency or competing release; use existing code/state for routine checks.

Live check after successful promotion: tssprint.com event page displayed the new Assam category image, selected full-size example and gallery image; all three loaded the same optimized asset. Direct live image returned200/image-webp and matched the local116,390-byte file exactly. The live event selector is left open for review. No overall score change claimed for this single photo replacement; the finished-backdrop-photo gap is closed.


## First completion-plan release — September 14, 22:45 PDT

**Live application:** `ff1d13d`, deployment `dpl_34TS8CmkWxEBt7rxCHPAe33PjnqR`, [combined artifact](https://tssprint-k1t0zzcg0-jordis-projects-94d2df39.vercel.app). Customer changes `42ef32e` / `2f5ad33`; merged newer policy release `9833c85` after detecting production had advanced during staging. Only generated HTML conflicted; regenerated all 33 routes. Current production alias confirmed READY. Existing entry gate, fonts, real imagery, pricing tables and payment work retained.

Shipped:
- Prominent Individual stickers / Sticker sheets / Roll labels selection above the shared configurator; compact three-choice row on phone. Hub and dedicated/query entry initialize consistent sheet/roll cuts. Switching formats retains artwork and valid options. Summary distinguishes stickers on backing sheets from rolls; roll quantity is labeled as labels.
- Clear existing per-sticker sheet offer plus a separate multi-design/whole-sheet quote path. Quote carries selected material, individual-sticker size and saved production attachment without putting storage references in the URL. The quote's service dropdown now visibly displays incoming service names; optional quote artwork supports replace/remove/retry. No per-sheet prices invented.
- Shorter sticker copy, collapsed sticker FAQs, fewer duplicated links and honest visible related-card labels for sheet illustrations / roll-fed production. Other photo/spec gaps remain; no Drive sweep.
- Admin separates independent page reach from ordered session activity (view product → add item → begin checkout). Cart page and upload are optional. Upload started/succeeded/failed session groups are separate and explicitly overlapping after retries. No confirmation-view payment claims or unsupported percentage-drop labels. Lead source rows and cart records paginate with completeness/cap disclosure; unidentified session signals are excluded and reported.
- Sticker uploader now records upload-start, rejects empty/over-50MB files locally, shows selection separately from persisted success, provides Retry upload and exposes errors accessibly. Non-preview production files are only described as saved after storage succeeds.

Verification:
- 60 focused pricing/cart/editing/checkout/analytics/contact/quote-attachment tests passed on combined source. Five new ordered-activity tests cover direct checkout, duplicates, session separation/order, missing identity/timestamps and failed-then-successful upload. Scoped lint passed; 33-route build/prerender passed. Existing large-chunk warning remains. Generated policy HTML contains harmless whitespace; no source conflict remains.
- Local browser: sheet/roll defaults, direct sheet route, quote material/size/service prefill, 320/390px format layout without horizontal overflow. Empty quote and sticker uploads reject with visible errors; removing/sending later restores the action. Sticker retry preserves the recoverable error. This tests validation recovery, not a real interrupted connection or expired storage object.
- Staged real disposable SVG upload persisted. Sheet quote retained the production attachment and selected context after navigation and reload. On final upload implementation, UI showed Selected / Uploading before storage success, then the saved filename. No quote submitted.
- Staged cart: 50 sheet stickers at $47.50 → edit same line to 50 roll labels at 3×2 inches / $54.62; retained SVG, one item after reload, $49.16 after displayed 10% discount. Removed the test item; cart returned empty. No paid order or customer email created.
- User signed into Chrome after the initial login limitation. All eight admin groups loaded in a separate check tab without changing records. After promotion, authenticated Sales & traffic loaded real records, the new ordered-session and upload sections, source breakdown and paginated carts with no data-load error. Tracking checks loaded milestones and quote-delivery status. Fresh authenticated access supersedes the earlier “login unavailable” limitation for this pass; it does not certify every admin mutation.
- Live stickers showed new choices and quote paths; merged footer retained Terms & EULA / Privacy Policy / Intuit disclosure. Eight changed/adjacent live routes returned200: stickers, sheets, rolls, contact, terms, privacy, cart, admin. Local viewport overrides reset.
- An initial public IAB smoke check loaded without the verification marker before it was added; that page-view/test activity can be present in historical reports. Prior QA records also remain. Do not infer sales trends from this small mixed sample or claim all staff/history filtering is clean. Later public inspection used `utm_source=codex&utm_medium=verification`.
- Live Settings → QuickBooks shows **production / disconnected**. The payment task's updated environment is active; it was given the exact merged commit/deployment to preserve. Production connection, payment and reconciliation still await that workflow. No extra provider deployment is needed merely to activate the environment change.

Current assessment remains customer7.75 (~7.8), tracking6 provisional, admin7.5 provisional; no automatic score inflation for a shipped batch. Remaining work: approved sheet/roll stock/specification/pricing facts, targeted physical-product evidence, actual cart/reset recipient completion, interrupted/expired upload recovery, reconciled paid purchase and one purchase event, full device/accessibility/performance checks and analytics historical-test hygiene. The full602-file review stays explicitly deferred. Coordination was limited to the actual competing production release and production-environment dependency.
