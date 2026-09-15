# Sticker Smith — next customer improvements

Created September 14, 2026, 21:09 PDT. Status: approved and in progress. Cart editing is deployed and verified; remaining material facts and operational outcomes are tracked below. Audience: Jordan and the two existing website tasks. Canonical plan lives here, linked from the [Sticker Smith ledger](sticker-smith-ledger.md). This continues the deployed page work rather than creating a new redesign.

## Current completion plan — September 14, 22:24 PDT

This section supersedes the original execution order below; earlier checkpoints remain history. Status: approved by the user; first implementation batch shipped. The original planning pass made no application changes. See the execution update below for current state. Current application baseline is `7e54d3d`, incorporating operations `84a330b`; last verified customer-interface assessment is 7.75/10. The 602 Drive entries remain inventoried, **not fully visually reviewed**, and a full review is deferred at the user's explicit direction. Use known shortlisted sources only when a specific gap warrants it. No routine messages to the other task.

### 1. Make sticker formats clear and consistent

Keep `/stickers` as the main ordering hub, with prominent **Individual stickers / Sticker sheets / Roll labels** choices and a short use explanation. Keep useful `/sticker-sheets` and `/roll-labels` landing pages; they already embed the shared Order component and preselect a format. Separate URLs do not require separate ordering implementations or an extra customer step.

Live finding: the format controls sit under Upload & preview and resemble preview toggles. Switching from Individual to Sheets retains Die-Cut, while entering the dedicated sheet route initializes Kiss-Cut. The sheet quantity is a count of individual stickers arranged on backing sheets, while the landing copy promises multi-design sheets. This is a product-definition mismatch, not a missing route.

Work: distinguish repeated individual labels on backing sheets from a multi-design sheet sold by sheet count. Confirm existing shop specifications and approved prices before offering sheet-based instant checkout. If records cannot establish them, use a clearly labeled sheet quote path, retaining artwork and selected details. Never relabel a per-sticker price as a per-sheet price. Confirm label count, roll/core/unwind requirements and compatible stocks for rolls; machine-specific work can use the existing quote flow. Match format, cut, units, summary, saved cart and server validation across both entry paths. Fix related-card photo claims where illustrations or roll-fed production are described as finished shop products.

Acceptance: a customer can recognize all three choices without interpreting the mockup; direct landing entry and hub selection produce consistent valid defaults, prices and units. Switching formats preserves applicable artwork/options and explains incompatible changes. Saved/legacy carts retain their original meaning. No invented sheet/roll pricing.

### 2. Correct reporting before interpreting abandonment

`Admin.tsx` currently computes separate unique browser counts for product/cart/checkout/confirmation pages, then labels differences as drop-off. These are not ordered journeys for the same cohort. Direct Continue to Checkout bypasses `/cart`, so this can imply a loss where there was a valid shortcut.

Work: initially label the existing chart as page reach and remove unsupported drop-off claims. Build the real event-based funnel with explicit identity, time window, event ordering and deduplication; support both direct checkout and cart-review paths. Treat artwork upload as an optional branch because send-later/design-help are valid choices. Final purchase stage must use a reconciled paid order, not a confirmation view. Expose uploads started/succeeded/failed, recoverable failures, abandoned/inactive carts and recovery outcomes with consistent periods. Audit pagination: source breakdown currently samples lead rows while the headline uses exact lead count; cart listing also needs explicit completeness handling.

Acceptance: controlled journeys with and without a cart visit, with each artwork choice, repeated reloads and a failed upload appear in the correct stages once. Missing data is labeled unavailable/capped, not zero. GA4 and site-record counts have explained differences. Staff/test filtering is verified before real-customer trends or campaign decisions are drawn. A purchase check waits for phase 5.

### 3. Reduce repetition and finish product evidence

Keep the entry gate, Noto Sans, genuine imagery and restrained motion. Shorten repeated proof reminders and Bay Area paragraphs; consolidate overlapping project sections and repeated links. Put specifications, quantity/price, artwork options and the next action before supporting copy. Expand details/FAQs on demand while keeping essential limitations visible. Preserve each useful landing page's distinct product information. Review `/custom-labels` overlap using Search Console/indexing evidence before any merge or redirect; audit canonical URLs, internal links and sitemap together.

Use the existing material/photo gap list. Backdrop photo is complete. Remaining priorities: exact sticker stocks/finishes, physical pouch, sheet example, paper weights/printed sides, relevant accessories and business-approved turnaround/policies. Review known sources first and consolidate only truly missing shop facts into one request. No full Drive sweep, new AI photography, new video or font replacement.

Acceptance: each page answers what it is, who it suits, what is included, price or quote basis, artwork requirement and next step without repeated paragraphs. Photos have honest source/type captions. Phone and desktop crops are usable. No unsupported material or delivery claim is introduced.

### 4. Verify artwork, recovery and admin work end to end

Previously passed: representative real card/pouch uploads survive edit/save/reload; all five secondary product families have configuration-edit coverage; live phone card editing passed. Do not redo that implementation. Exercise remaining file types, size limits, unavailable previews, expired artwork, interrupted/failed upload, retry, replacement/removal, multi-item checkout editing and saved-cart restoration across browsers. A selected file is not marked saved until persistent storage succeeds.

Verify actual recipient completion of cart recovery and password reset, expired/reused links, quote/customer/staff delivery and safe retry without duplicate messages. Provider Delivered is existing evidence, not proof of inbox placement or successful link completion. Use controlled records and authorized recipients; password entry remains with the user. Keep direct email proof approval.

Admin: repeat signed-in queue/search/filter/detail journeys on desktop and phone; verify notes, artwork, approval evidence, shipment/pickup fields and customer-facing status stay aligned. Prior all-eight-group live checks and rollback SQL checks are recorded in the ledger. This turn's available browsers showed Admin Login, so a fresh authenticated review remains pending.

Acceptance: a customer can recover from each failure without rebuilding the order; the shop sees the same correct configuration/artwork and actionable status. Record release, test reference and outcome, without copying customer data into the ledger.

### 5. Close payment and operational verification

The existing payment task owns Intuit. Preserve its changes; consult its status only when the integration becomes an actual dependency. When production setup is ready, verify an authorized bounded transaction through checkout, invoice/payment reconciliation, one order, receipt, correct totals/promo/artwork and one purchase event. Test return/retry/cancel paths without duplicate charges/orders. Verify actual enabled card/wallet methods on supported devices; buttons/logos and sandbox simulation are insufficient. Exercise direct proof approval and appropriate pickup/shipping notification using controlled orders, without claiming physical fulfillment from a test.

Acceptance: provider, order, customer confirmation/email, admin and analytics agree on the transaction and amount. Remaining provider/business decisions stay explicitly pending rather than receiving a passing rating.

### 6. Final usability, accessibility and release gate

Check representative sticker, sheet/roll, business-print, packaging and quote journeys on desktop and phone, including keyboard/focus, zoom, contrast, errors, reduced motion and slow connections. Measure performance; 320/390px emulation is not real-device Safari/Android coverage or field Core Web Vitals. Count actions and pages for a defined scenario, then separately count checkout/payment effort. The historical 9→6 actions / 4→3 pages comparison stopped before checkout entry and payment.

Acceptance: focused tests and staged checks pass, current combined production revision is preserved, changed live routes are checked, and the same rating rubric is updated with evidence. Report paid-flow readiness separately. Later uncoached customer sessions can test comprehension; they are not required to invent a 10/10 score or claim conversion gains.

**First implementation checkpoint:** format discoverability/units and honest funnel labels. These can proceed without Intuit; true sheet prices require verified shop inputs. The fuller event funnel and operational tests follow, not another redesign.

## Original starting point and ownership — historical

- Last verified customer release: combined commit `fc4b0ed`, deployment `dpl_5QExPMWTvy3jtueqygxLQvzhvzfE`. Recheck the current combined branch before implementation so later payment/admin work is retained.
- Customer-interface assessment: 7.6/10 using the historical weights. This is reviewer judgment, not measured conversion. See the [page-by-page findings](customer-page-review-2026-09-14.md).
- This task owns cart configuration editing, customer-facing material evidence, and public page verification. “Address preview readiness gaps” owns payment/Intuit, server price/promo enforcement, admin and tracking implementation. Coordinate shared cart types and checkout summaries before edits; do not duplicate the provider integration.
- Keep the entry gate, Noto Sans, direct email proof approval, existing useful video and restrained motion. Use actual shop work where available and honest labels where it is not. Quote-only services stay quote-only.

## 1. Complete cart editing — first implementation

**Customer outcome:** Open an existing item, change its options or artwork, and save back to the same cart line without rebuilding the order.

Work:

1. Inventory every currently purchasable product and its saved fields; distinguish purchase configurations from service estimate requests. Start with business print and packaging, then other products actually sold through the shared product configurator. Preserve working sticker editing.
2. Save stable product/variant identifiers and the selected size, pieces per batch, batch count, finish/add-ons and production-artwork references. Version the saved configuration so old carts can be handled explicitly. Do not infer the configuration solely from a display name or price.
3. Add Edit to cart and checkout summaries for supported product types. Restore the matching product screen with its actual saved options, preview/attachment state and “Save changes” action. Cancel leaves the cart untouched. Preserve artwork until the customer intentionally replaces or removes it.
4. Recalculate against approved catalog pricing through the existing server validation path. Display a changed price clearly. Preserve batch count, enforce quantity limits and remove incompatible upgrades when switching variants, with visible feedback.
5. Handle old or unavailable configurations safely. Only prefill values that can be recovered reliably; explain when an item needs reconfiguration. Never silently substitute defaults or remove the old line before a valid replacement is saved.

**Acceptance:** For each purchasable product family, add → edit → save → reload retains one correct line, correct artwork and correct totals. Cancel changes nothing. A multi-item cart leaves other items intact. Changing batches repeats the configured print run; changing pieces changes that print run. Expired artwork access, failed saves and unavailable variants have recoverable states. Repeat representative flows on phone and desktop, including checkout-to-edit and saved-cart restoration. Existing pricing/promo enforcement tests still pass.

**First review artifact:** one business-card order and one packaging order edited successfully from cart, including preserved artwork and before/after totals. Then extend the same behavior to remaining eligible products.

## 2. Close material and photo gaps

**Customer outcome:** Understand what the selected product looks like, what is included and which use it suits before ordering or requesting a quote.

Use the existing [Drive inventory](asset-sources/marketing-drive-2026-09-14.md) and [material-photo source record](asset-sources/material-photographs-2026-09-14.md). Search the relevant known folders and suitable shop Instagram posts; do not repeat a full library inventory. Inspect shortlisted originals and confirm their product/finish before choosing one. Existing credited external reference images remain reference examples, not evidence of TSS manufacturing stock; check reuse rights when selecting external assets.

| Priority | Product evidence needed | Page/use |
| --- | --- | --- |
| First | Matching matte/gloss samples; clear, paper and raised/UV examples tied to actual offered stock | Sticker comparison and selected finish |
| First | Physical finished pouch plus confirmed base print method and finish/add-on differences | Packaging, currently 6.5/10 |
| First | Actual multi-design sheet; clear distinction between sticker count and sheet layout | Sticker sheets, currently 6.5/10 |
| Next | Postcards, magnets and confirmed card/paper weights, standard finish and printed sides | Business print |
| Next | Finished backdrop and table cover; frame/graphic/accessory scope | Event displays |
| Later | Actual wall installation and owner/team portrait | Signage/About where they add useful evidence |

Presentation: consistent crop, scale, neutral lighting where possible, legible detail, optimized delivery size and short appearance/use/scope captions. Do not simulate reflections or texture as physical proof. Keep honestly labeled artwork/format illustrations until an appropriate real image exists. A short real tilt clip can help explain holographic or raised finishes if available; no new video production is required.

**Acceptance:** Every selected image has a source, classification, relevant product and verified/unknown stock status in the ledger. Captions match what the image actually shows. Final desktop/mobile crops remain readable. No broken assets or decorative image replaces the ordering controls. Product claims come from the shop's records or confirmation, not appearance alone.

**Only if existing records cannot answer:** prepare one short list for the shop covering exact material names, paper weights, pouch process, included sides/hardware and realistic lead times, plus a small shot list. Gather this after source review; do not ask Jordan to repeat information already available.

## 3. Verify customer order, email and recovery outcomes

**Customer outcome:** What checkout promises agrees with the order, receipt, proof communication and eventual pickup/shipping status.

Start non-payment checks while the payment task finishes. Obtain its current verified status before testing anything it has already completed. Use controlled test records and inboxes; avoid sending messages to actual customers. Any real transaction needs an agreed amount and the appropriate user payment step. Verification does not enable abandoned-cart campaigns.

| Journey | Evidence required | Owner/dependency |
| --- | --- | --- |
| Quote request | Saved once; customer receives accurate status; staff can find it; notification failure distinguishable from save failure | Customer flow + existing admin/email implementation |
| Email my cart → restore | Message reaches test inbox; signed link restores correct items; existing cart replacement is explicit; expired link is helpful | Customer flow; coordinate recovery implementation |
| Forgot password | Test email received; valid reset flow and expired-link recovery; return to account | Customer flow/auth; user completes credential changes |
| Standard sticker purchase | Correct total/discount, one paid order, itemized provider/invoice record and receipt | Payment task leads; customer flow checks presentation |
| Non-sticker purchase | Same evidence plus retained size/finish, artwork and batch/piece details | Depends on phase 1 and provider readiness |
| Direct proof communication | Order reference, artwork needed/proof instructions and approval/revision response are clear; no premature “printing” claim | Existing direct email process; no portal |
| Pickup and shipping | Accurate instructions and relevant ready/tracking status; no invented shipping event | Controlled test/status exercise, then real fulfillment evidence when available |
| Tracking | Actual event receipt, correct source/value and deduplicated transaction; staff/test exclusions and consent behavior | Tracking task leads; this task records evidence and limitations |

**Acceptance:** Record date, environment/release, test reference, expected versus actual result and sanitized evidence. A button, HTTP 200, provider acceptance or fixture test alone is not an end-to-end pass. For outcomes not yet exercised, record “not verified,” not “working” or “broken.”

## 4. Final customer check and consistent rescore

- Test representative sticker, business-print, packaging and signage journeys on desktop and a real phone if available. Cover keyboard/focus, zoom, readable contrast, upload/error states, reduced motion and slow-network performance. Measure performance before assigning a speed score.
- Review the existing policy drafts against actual shop practice; publish only business-approved terms. Do not invent guarantees or production deadlines to fill a page.
- Release customer changes from the current combined code after focused tests and staged browser checks; verify the live build and changed routes. Keep review notes tied to a specific revision.
- Update the existing page ratings and unchanged weighted rubric with reasons and evidence. Separate interface quality from verified operational readiness. Aim to remove observed blockers; do not promise a 10/10 or conversion increase from cosmetic work.
- A later first-time-customer session can test clarity without coaching. Record task success, confusing choices, errors and time; a small sample is diagnostic, not proof of a conversion lift.

## Deferred work

Durable automated referral earnings/payouts, new proof portals, another font search, new AI product photography and a new promotional video are outside this implementation sequence. The existing manual referral request and direct order communication remain appropriate unless the shop chooses a different business process.

## Execution checkpoints

1. Cart editor working for the two priority product families, then all remaining purchasable families.
2. Material/source gap list resolved as far as current records allow; only truly missing facts/photos sent for shop input.
3. Controlled recovery and purchase outcomes verified in coordination with the existing payment task.
4. Combined release verified, ledger updated, remaining unknowns and comparable ratings reported.

Each checkpoint gets a concise progress update. Planning approval does not mean an outcome has already been implemented or tested.


## Approved-plan progress — September 14, 21:40 PDT

- **Checkpoint 1 shipped:** combined release `6d95167`, deployment `dpl_Av72JrmyMaNuyKsF8VLYhNUoBYpS`, verified at tssprint.com. Business cards, flyers/door hangers, postcards, magnets and packaging now restore/edit their saved configuration; existing sticker editing is retained. Staged real uploads retained card/pouch artwork through edit, save and reload. Local multi-batch, cancel, invalid minimum and all-five-family checks passed. Live phone card edit/reload passed. Expired artwork access and network-failure recovery were not separately exercised in the live browser.
- **Checkpoint 2 reviewed, partially blocked on shop facts/assets:** targeted food-packaging Drive review still shows 19 PDFs, no physical-pouch photo selected. Found actual Assam Convention backdrop installation on the shop's Instagram; original video export failed, so it is a sourced candidate, not a newly installed website asset. Consolidated remaining requirements are in the material-source addendum. Questions sent for base pouch print method and paper/sticker stock facts; no specifications invented.
- **Checkpoint 3 coordinated:** the other task confirmed live GA4 receipt for upload, add-to-cart, begin-checkout and delivery-selection events; six existing controlled migration emails show Delivered in Resend. That does not establish inbox placement, successful cart-link/reset completion or a paid transaction. Its authenticated admin SQL exercises passed and rolled back. Durable contact delivery work is separate and was not included in this release.
- **Checkpoint 4 release verified:** 50 relevant tests, lint and 31-route prerender passed. Seven changed/adjacent live paths returned 200; production alias resolves to the tested deployment. Customer-interface score is now 7.75/10 (rounded 7.8); paid-flow, real-device performance, full accessibility and fulfillment remain unverified separately.


September14, approximately22:11PDT follow-up: user approved Instagram imagery. The first Assam carousel slide yielded a full-resolution real photo; added to backdrop selector, event gallery and project detail. This closes the actual-backdrop-image gap. Original and exact crop/source are retained in the source record. Pouch/material stock and other unmatched photos remain unresolved; no unrelated claims were inferred from this event photo.


## Execution update — September 14, 22:45 PDT

First batch deployed as combined `ff1d13d` / `dpl_34TS8CmkWxEBt7rxCHPAe33PjnqR`; includes the newer policy release9833c85. Details and dated evidence are in the ledger.

- **Phase1 implemented to available facts:** visible format choices, consistent defaults, honest units and multi-design/machine-roll quote handoff with retained artwork. True per-sheet instant pricing and precise manufacturing compatibility still require verified shop facts.
- **Phase2 first reporting repair shipped:** independent page reach, ordered session milestones, optional upload outcomes, bounded pagination/completeness. Live authenticated data loads passed. Paid-transaction linkage, GA4 processed filters and historical QA separation remain pending; the current small sample is not sales-performance evidence.
- **Phase3 partly shipped:** sticker/support-page copy and FAQ cleanup plus accurate image labels. Existing policy pages/disclosures merged from the other task. Remaining asset/stock gaps unchanged; full602-entry review deferred.
- **Phase4 additional verification passed:** actual staged quote artwork retention/reload; sheet-to-roll cart edit/reload without duplication; empty-file errors/retry/send-later recovery; eight live admin sections and new reports. No new quote/email/payment sent. Actual recovery-link recipient completion and interrupted/expired file exercises remain open.
- **Phase5 dependency advanced:** production QuickBooks environment confirmed active, connection still disconnected; payment task has the combined release reference.
- **Phase6 partial:** 60 tests, scoped lint, 33-route prerender, narrow-screen format checks and eight live HTTP paths passed. This is not real-device or full accessibility/performance certification.

Next independent implementation/verification work: remaining upload failure cases and saved-cart/recovery completion using controlled records; collect only missing stock/pricing facts from existing records or one consolidated shop response. Do not repeat completed format/cart implementation or start a full media-library audit.


## Cal feedback correction — September 14, 23:02 PDT

Owner relayed that Cal found sticker ordering too elaborate, disliked the material dropdown, preferred the same-design material comparison, and uploaded a PDF with no preview. Owner confirmed PDF and asked to check the other file types. This is direct usability evidence; do not raise the customer score merely because more controls or explanatory copy shipped.

Implemented locally: visible six-material buttons, same-design real gloss/matte comparison directly visible, material details optional, shorter format choices and pricing copy, one upload action plus compact send-later/design-help choices. Earlier generated six-material set was rejected by the owner and was never published (see material-photographs source ledger); this correction reuses the real Jukebox paired photograph, not the rejected AI set. A complete matched set of the shop’s actual six materials remains a future photography task.

Confirmed PDF root cause: the old sticker preview accepted browser images only even though PDF production uploads were accepted. Added lazy first-page PDF rendering using pinned PDF.js 6.3.289 with local worker/font/CMap/ICC/WASM assets. Reference: https://mozilla.github.io/pdf.js/examples/ (consulted September 14). PDF-compatible AI also renders. Image previews show the whole file without clipping it into an arbitrary sticker shape. Shared ProductOrder/contact/vehicle quote uploader uses the same renderer. Production originals and their private storage access are unchanged.

Small local thumbnails are cached by exact saved artwork path (maximum eight entries, 200 KB each), supporting same-browser cart editing/reload. This does not promise previews for old uploads, other devices, cleared/disabled/full storage, or evicted/oversized thumbnails; the original file remains attached, with an explicit reselect-to-preview message. Preview rendering and upload success have separate statuses. Abort handling prevents a replaced/removed file’s late preview from returning.

Local verification: PDF (two-page raster and single-page vector/text), PNG, JPG, SVG, WebP, GIF and PDF-compatible AI render. Broken PDF/PNG, locked PDF, EPS/TIFF and empty file show clear fallback without a stale image. EPS, PSD, TIFF, HEIC and older non-PDF AI are accepted production types but do not have inline previews; export PDF/PNG/JPG for these. Shared uploader PDF→PNG replacement and failed-upload retry preserve the visible preview. 390px mobile vector preview/material buttons visually checked; no horizontal overflow (382px content/viewport). Local Vite has no upload API, so local tests deliberately show upload failure independently of successful rendering. Real storage/cart checks remain for the staged release.

Automated checks: 21 preview-cache/pricing/cart-edit/quote tests pass, including cache bounds/isolation/failure behavior and unsupported/empty/oversize file messages; scoped ESLint and TypeScript/build pass. Build renders 33 public routes. New PDF package has no npm audit finding; pre-existing dependency findings remain separate maintenance work.

Latest live release changed during this work: QuickBooks readiness commit ba67ea1 at approximately 22:55 PDT. Preserve it in the combined release. No payment, quote submission, customer email, or 602-entry Drive review performed for this correction. Production verification and final release ID will be appended after staging.


### Preview correction deployed — September 14, 23:08 PDT

Live application commit **194b238**, deployment **dpl_FMpzs4EpV4fKzBvH26fF2zV8f3Vr** (`https://tssprint-b8yl8xr79-jordis-projects-94d2df39.vercel.app`), promoted and confirmed READY on tssprint.com at approximately 23:07 PDT. Includes the other task’s ba67ea1 QuickBooks readiness changes. Combined checks: 23 focused tests pass; scoped lint and 33-route prerender pass.

Real staged production-storage test: two-page PDF previews and uploads successfully; Clear material changes 50-piece price to $66.50; add-to-cart retains one correctly configured line and PDF attachment; cart edit and full reload restore the preview. PDF→PNG replacement saves to the same line and reopens with the PNG thumbnail. Switching to the sheet-quote handoff also retains the PNG preview in the shared uploader. Test cart item removed through normal cart UI; no order, payment or quote submitted. Two pending test artwork objects were created on the stage. Local CMYK PDF and removal-during-preview checks also passed.

Public tssprint.com check: fresh vector/text PDF both rendered (page 1 of 1) and showed the successful private upload status. No live cart or order created for this final check; one additional pending test artwork object. QA query markers used for the public check. The files are synthetic, marked TEST ONLY / DO NOT PRINT.

Next priorities: (1) actual email-my-cart and password-reset recipient/link completion, including expired links and cross-browser cart restoration; (2) multi-item cart/checkout editing and mobile accessibility/performance, with payment work left to the existing task; (3) remaining exact material/paper/pouch specifications and genuine matched photos from known shortlisted sources/shop facts; (4) reconcile the controlled journeys with admin/GA4 before interpreting abandonment; (5) full authorized paid purchase, receipt, admin and purchase-event reconciliation once Intuit is ready. Keep the 602-entry Drive review deferred. Cal’s feedback remains evidence against adding complexity; no automatic score increase for this release.
