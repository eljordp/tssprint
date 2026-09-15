# Authentication email logo repair — 2026-09-15

- Reproduced broken image in live Supabase signup preview; original tssprint.com image returned HTTP 200 and decoded as 400 × 224 PNG.
- Root cause: Supabase dashboard Content-Security-Policy img-src excludes tssprint.com; its srcdoc email preview inherits that restriction.
- Copied the unchanged original logo into the new public brand-assets bucket (1 MB limit; PNG/JPEG/WebP only; no anonymous upload/delete policies). Existing private order-artwork bucket unchanged.
- Public URL: https://obomvaiaboqkvbyvlnav.supabase.co/storage/v1/object/public/brand-assets/sticker-smith-logo.png
- Saved signup and password-reset templates directly in production Supabase. Removed duplicated legacy password-reset body. Kept ConfirmationURL placeholders and subjects intact.
- Reduced header padding to 20px and rendered logo at 144 × 81, preserving its aspect ratio.
- Verified the signup logo after reload; verified reset preview has one heading and a decoded 400 × 224 logo. No email sent; inbox rendering/delivery was not tested.
