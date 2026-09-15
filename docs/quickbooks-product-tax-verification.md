# QuickBooks product tax setup — September 15, 2026

## Change

The website now maps Mylar Packaging, Event Displays and Table Covers to distinct QuickBooks product records: Website Mylar Packaging, Website Canopies and Website Table Covers. The admin's **Set up taxable website products** action creates missing records as taxable NonInventory items using the existing Custom Card Stock product-income account. Existing accounting records and tax rates are preserved.

The action requires a signed-in administrator, the configured site origin, a connected company, USD, and enabled automated sales tax. Existing conflicting records stop the setup before writes. Stable request IDs and catalog checks make retries safe. Catalog reads paginate beyond 100 items.

QuickBooks calculates the invoice tax from the configured tax settings and delivery address. Checkout uses the returned tax and total. Event display pages retain their existing exact-estimate flow; this change does not turn price guides into instant purchase offers.

## Local verification

- 63 QuickBooks, pricing and payment-policy tests passed, including taxable mapping, safe retries, conflicting-item rejection and catalog pagination.
- 8 analytics tests passed; staff/test suppression remains intact.
- Scoped lint and the combined production build passed.
- Included the shared cross-platform responsive image fix (6fa67a9); its two tests passed. Removed the temporary image-copy workaround.

## Live verification

- Published commit e1af68c in production deployment dpl_9od7c9qh2QL5NqFevCh9Q15Nji8s. Included customer work through 6fa67a9. Public checkout config returns enabled with all 11 mapped categories; unauthorized setup POST returns HTTP 403.
- Signed-in production admin confirmed **Verified 3 taxable website products. Income account: Sales of Product Income.** All three new records are NonInventory and Taxable Yes.
- Live Mylar cart now reaches **Review total with tax**, replacing the product-mapping blocker. Existing event pages still request an exact estimate.
- Created unpaid verification invoice **3276** using the shop email and Hayward pickup: 50 matte stickers plus 100 mylar pouches. Subtotal **$182.50**, AUTO10 discount **$18.25**, QuickBooks sales tax **$17.66**, total **$181.91**.
- The website invoice review and Intuit hosted payment page both display **$181.91**. Hosted page offers Debit, Credit and Apple Pay, with due date September 15, 2026. Inspected the website invoice layout in Chrome.
- No card information entered, no payment submitted, and no paid-order receipt intentionally sent. An unpaid invoice does not establish card settlement, inbox delivery or GA4 purchase reporting. Invoice 3276 is a verification record, not a real sale.
