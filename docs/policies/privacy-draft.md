# Privacy notice — owner review draft

Prepared September 14, 2026. **Not published or effective yet.** Proposed URL: https://tssprint.com/privacy. Confirm the items below before publication; this draft reflects the inspected website, not a review of all shop practices.

## Proposed customer-facing copy

### Who we are

The Sticker Smith operates tssprint.com. Contact us about privacy at thestickersmith@gmail.com, (510) 634-8203, or 23673 Connecticut St, Hayward, CA 94545.

### Information we collect

When you request a quote, upload artwork, create an account, save a cart, join our email list or place an order, we collect the information you provide. This can include your name, email, phone number, delivery address, artwork, project instructions, product selections, order history and messages.

Our website also records activity such as pages visited, product and cart interactions, checkout steps, referral links, campaign information, browser/device information and visit identifiers. Our hosting, analytics and payment providers may receive technical information such as IP addresses and browser information when you use their services.

### How we use information

We use contact and order information to respond to inquiries, prepare quotes and proofs, arrange payment, produce and deliver print work, provide support and keep business records. We use saved cart information to restore shopping sessions and provide a recovery link when requested. We use website activity to understand which pages and services are used and where checkout fails. If you join the print list, we use your email for that subscription.

### Service providers and payments

The website uses Vercel for hosting, Supabase for accounts, database and file storage, and Resend for transactional email. Google Analytics and Vercel Analytics help measure website use. Payment options shown at checkout use the named payment provider. PayPal and any enabled Square or QuickBooks payment services process payment information under their own privacy notices. Our order records contain payment references, amounts and status; do not send full card numbers or security codes in our contact forms or artwork files.

Where QuickBooks invoicing is enabled, the shop's integration sends customer contact details and itemized order information to Intuit and reads invoice and payment records to reconcile the order. Access to the shop's QuickBooks connection is restricted to authorized shop administrators. Disconnecting the integration stops its access; it does not delete records already kept in QuickBooks.

### Cookies, browser storage and tracking

We use browser storage for account sessions, cart recovery, checkout details and visit attribution. Google Analytics may use cookies and identifiers. These providers may collect information about activity over time and across websites according to their settings and privacy notices. Browser controls can restrict cookies and clear local storage; doing so may remove your saved cart or sign you out.

**California Do Not Track disclosure:** The current website does not implement a separate response to the browser's Do Not Track signal. [Owner review: verify Global Privacy Control handling and advertising/remarketing settings before publication; do not promise that controls are honored unless implemented and verified.]

### Access, corrections and deletion

Contact thestickersmith@gmail.com to request access to, correction of or deletion of information associated with your email or order. We may need to verify that the request belongs to you. We may retain information needed for outstanding orders, accounting, legal obligations or disputes. [Owner review: confirm who handles these requests, applicable rights, and actual retention periods.]

### Retention and security

[Owner review: specify actual periods or criteria for order/account records, quotes, artwork, abandoned carts and analytics. There is no verified automatic deletion schedule covering all these records.]

We use access restrictions for administrative functions and private production-file storage. QuickBooks connection tokens are encrypted on the server. No security method guarantees that information can never be accessed without authorization.

### Children and policy changes

[Owner review: confirm intended minimum age and how requests involving children are handled.]

We will post changes on this page and update its effective date. For a significant change affecting information already collected, we will describe the change and any additional notice or choice required by applicable law.

## Publication decisions still needed

- Confirm the legal business/operator name and privacy contact.
- Confirm retention periods and the process for deletion/correction requests.
- Confirm whether customer data or artwork is shared with outside production vendors; add their categories and purposes if so.
- Confirm whether advertising features, remarketing, audience exports, or any sale/sharing of data are enabled. Do not claim “we never sell or share” from source-code inspection alone.
- Verify the actual marketing unsubscribe process and add the instruction customers can use.
- Confirm age practices and whether CCPA or other additional notices apply.
- Update the QuickBooks paragraph to match the exact released feature; it is not public checkout today.

## Evidence used for drafting

Inspected: src/lib/analytics.ts, src/lib/email.ts, src/pages/Checkout.tsx, server/cart-api.js, server/quickbooks-api.js, production artwork components, Supabase order/email functions. Owner operating practices still require confirmation.

California Attorney General guidance recommends describing collection, uses, retention, choices, third-party tracking, and Do Not Track response: https://www.oag.ca.gov/news/press-releases/attorney-general-kamala-d-harris-issues-guide-privacy-policies-and-do-not-track (read September 14, 2026).
