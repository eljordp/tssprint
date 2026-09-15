# Sticker Smith — next customer improvements

Created September 14, 2026, 21:09 PDT. Status: approved and in progress. Cart editing is deployed and verified; remaining material facts and operational outcomes are tracked below. Audience: Jordan and the two existing website tasks. Canonical plan lives here, linked from the [Sticker Smith ledger](sticker-smith-ledger.md). This continues the deployed page work rather than creating a new redesign.

## Starting point and ownership

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
