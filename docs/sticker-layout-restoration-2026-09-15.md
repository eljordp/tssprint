# Main sticker page layout restoration — September 15, 2026

User requested the older sticker ordering layout, visible choices instead of dropdowns, and the same sticker design shown separately for the selected matte/gloss finish. Scope is `/stickers`; other routes retain their current presentation. No further messages to other tasks after the user's correction.

## Changes

- Restore the earlier split hero with the actual die-cut sticker photo.
- Restore desktop Shape / Material / Size / Quantity columns, with visible shape icons and size buttons.
- Place the current working artwork/preview and summary panels beneath the choices.
- Keep current PDF rendering, upload status/retry, server pricing, cart editing, format defaults, payment and analytics behavior.
- Show a display crop of only the selected photographed matte or gloss sticker from the existing credited Jukebox pair. The same artwork is used for both; no finish is simulated. Other materials retain existing real reference images.
- Scope the layout through `embedded`: dedicated product pages keep their existing two-column configuration and material comparison.
- Restore the upload button's focus target for the main page's missing-artwork validation.

## Checks

- Scoped ESLint and TypeScript/Vite build passed.
- Existing pricing 8/8, cart editing 5/5, artwork preview 6/6 tests passed.
- Desktop screenshot: all four option columns visible together; matte/gloss switches show distinct selected-only samples.
- 390px viewport: content/client width both 382px, no horizontal overflow, no dropdowns.
- Local cart: edit existing 50-piece matte line to 100 clear 3-inch circle stickers; same line ID, correct $112.84, send-later intent preserved. Removed test item normally afterward. Local backend was unavailable, explicitly shown by cart; no production cart or payment was created.
- Dedicated die-cut page still has its two selects and original paired material photograph.
- No application source changes outside Order.tsx and MaterialGuide.tsx relative to the latest underlying site release; regenerated page assets are build output.

Deployment and final live checks will be recorded below.

## Live release

Promoted September 15 at approximately 09:41 Pacific. Vercel deployment `dpl_8LLPCZMPdqkuDfEUxf3H1JJx3aGT`, https://tssprint-el2o6sjr3-jordis-projects-94d2df39.vercel.app, READY and assigned to https://tssprint.com. Built application 1292570; main sticker change 5e0e1a3. Final source also incorporates e1af68c's removal of four unused snapshot copies; those extra unused files in the prebuilt artifact do not affect page rendering.

Compared with the live baseline e1af68c, application source differs only in Order.tsx and MaterialGuide.tsx. Normalized visible text in all other prerendered routes is identical. Final live browser: restored heading, zero configurator selects, matte-only image by default; Gloss switches to gloss-only image and selected state; 3-inch size updates 100-piece price to $80.60. No production cart, artwork upload, message, order or payment created by this task.
