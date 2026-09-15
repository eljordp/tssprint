// New charges must use the tax-enabled path once QuickBooks is launched.
// Keep existing provider connections for accounting and payment recovery.
export const quickBooksOnly = () => process.env.QUICKBOOKS_CHECKOUT_ENABLED === 'true'
export const taxEnabledPaymentMessage = 'Please refresh checkout and pay through QuickBooks so your invoice includes the correct sales tax.'
