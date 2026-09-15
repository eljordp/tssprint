# Material comparison photography

Audience: sticker customers comparing finishes. Replaces the repeated unrelated bottle-label photograph in MaterialGuide and adds photographs to the comparison cards. Canonical delivery assets: `src/assets/optimized/materials/`. Status: these reference assets are included in the live combined release `6d95167` (September 14); earlier local/browser checks are documented below. Exact TSS stock and reuse-rights confirmation remain separate from source attribution.

## Direction and feedback

The owner asked for realistic material pictures or real online material photographs with consistent formatting. An initial six-image generated set used a white rounded-square sample with cyan circle/black waves on gray. The owner rejected the first samples: “that looks ai tho no? not like a picture of something real.” None of the generated samples are used or published. Lesson: uniform geometry alone does not make a convincing material photo; avoid generated material surfaces for this site. Use actual photographs and preserve optical cues, not painted highlights.

Built-in image generation was used only for that rejected experiment. Original generated files remain under `/Users/admin/.codex/generated_images/01a08351-7f47-74d1-a195-424ddb1cf8da/`; they are not site assets. New direction uses photographed reference examples with visible source credit. No new AI generation or aesthetic retouching is applied to these source photos. Delivery derivatives resize and encode the originals as WebP; consistent framing is CSS, preserving the original files.

## Selected references

All pages opened September 14, 2026. These are third-party reference photographs, not TSSPrint customer jobs or proof of the shop's exact stock. Source links remain visible in the guide. They are not represented as original, commissioned or royalty-free photography.

| Finish | Source page | Source image | Delivery file / rationale |
|---|---|---|---|
| Matte vinyl | https://www.standoutstickers.com/faq/matte-vs-glossy-stickers | https://static.standoutstickers.com/legacy/newhtml/img/matte-stickers-meopta.jpg | `matte-vinyl-reference.webp`; source explicitly identifies photographed matte labels; soft light across black surface. |
| Gloss vinyl | https://www.standoutstickers.com/faq/matte-vs-glossy-stickers | https://static.standoutstickers.com/legacy/newhtml/img/glossy-stickers-electric-zombie-what-a-rush.jpg | `gloss-vinyl-reference.webp`; source explicitly identifies gloss; actual specular reflections. |
| Clear | https://stickerapp.com/blog/sticker-academy/materials-and-laminates-how-to-make-stickers | https://stickerapp.com/media/2527x2527/f1b55d1134/transparent-sticker-skull.jpg | `clear-vinyl-reference.webp`; fingers visible through unprinted areas; original artist mark retained. |
| Holographic | Existing shop portfolio, `/projects?project=stickers-holographic` | Existing `stickers-holographic-1000.webp` | Real Flight Risk shop print, retained. |
| Paper | https://www.onlinelabels.com/materials/white-matte-labels | https://images.onlinelabels.com/images/dlp/og/standard-white-matte-labels-banner-og.jpg | `paper-label-reference.webp`; actual white paper candle label. Original 375px, not upscaled. This demonstrates white matte paper, not every available paper coating. |
| Raised / UV | https://www.carstickers.com/products/stickers/custom-stickers/setup/embossed-stickers/ | https://dejpknyizje2n.cloudfront.net/media/carstickers/versions/person-holding-embossed-sticker-u2f0a-9456-x1116.png | `raised-uv-reference.webp`; manufacturer identifies raised spot UV; local highlights on selected design details. Does not specify TSSPrint's process. |
| Same-design comparison | https://www.jukeboxprint.com/blog/glossy-vs-matte-stickers | https://storage.jukeboxprint.com/s/images/gloss-vs-matte-die-cut-stickers.jpg | `matte-gloss-comparison-reference.webp`; actual same artwork side by side, original Glossy / Matte labels retained. |

## Alternatives and limits

StickerApp's broad material gallery includes samples and artwork but does not identify the exact finish on every generic vinyl image, so those were not used for matte/gloss. Its kraft paper example does not establish that TSSPrint offers brown kraft; a white paper reference was selected instead. The first Car Stickers thumbnail was only 165px and was rejected in favor of the 1116px source displayed in the image gallery. Generated variants were rejected for appearance before integration.

No competitor durability, adhesive, process availability or shipping promises were adopted. The guide asks for a shop sample to confirm the exact stock. The website photo layer should eventually be replaced by an owner-shot set of the shop's actual materials.

## Verification

Scoped ESLint and TypeScript/Vite build passed. Desktop and 390px mobile comparison visually checked: all seven images load, six cards map to the correct existing material values, selected state stays synchronized with the material dropdown, and Clear changed the displayed 50-piece price to $66.50. No horizontal overflow (382px document/client width at the 390px viewport), no browser console errors. No cart item or payment was created.
