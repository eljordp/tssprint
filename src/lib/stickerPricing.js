export const STICKER_QUANTITIES = [50, 100, 250, 500, 1000, 2500];
export const MIN_STICKER_QUANTITY = 50;
export const MIN_ORDER_SUBTOTAL = 35;
export const defaultStickerBasePrices = [
    { maxQty: 50, price: 0.95 },
    { maxQty: 100, price: 0.62 },
    { maxQty: 250, price: 0.47 },
    { maxQty: 500, price: 0.38 },
    { maxQty: 1000, price: 0.31 },
    { maxQty: Infinity, price: 0.28 },
];
const roundMoney = (amount) => +amount.toFixed(2);
export function isValidStickerQuantity(quantity) {
    return Number.isSafeInteger(quantity) && quantity >= MIN_STICKER_QUANTITY;
}
/** Interpolate order totals, preserving the configured preset prices.
 * The open-ended tier is anchored at the final storefront preset (2,500).
 * Beyond that anchor its per-piece rate applies. Never discount earlier
 * pieces retroactively when a customer adds one more sticker.
 */
export function getBasePrice(quantity, config) {
    if (!Number.isFinite(quantity) || quantity <= 0)
        return 0;
    const tiers = config.basePrices
        .filter(tier => tier.maxQty > 0 && Number.isFinite(tier.price) && tier.price >= 0)
        .slice().sort((a, b) => a.maxQty - b.maxQty);
    if (tiers.length === 0)
        return 0;
    let previousQty = 0;
    let previousTotal = 0;
    for (const tier of tiers) {
        const anchorQty = Number.isFinite(tier.maxQty)
            ? tier.maxQty
            : Math.max(STICKER_QUANTITIES[STICKER_QUANTITIES.length - 1], previousQty);
        // Also prevent a decreasing total if an older saved config has bad anchors.
        const anchorTotal = Math.max(previousTotal, anchorQty * tier.price);
        if (quantity <= anchorQty && anchorQty > previousQty) {
            const progress = (quantity - previousQty) / (anchorQty - previousQty);
            return (previousTotal + progress * (anchorTotal - previousTotal)) / quantity;
        }
        previousQty = anchorQty;
        previousTotal = anchorTotal;
    }
    const lastRate = tiers[tiers.length - 1].price;
    return Math.max(previousTotal, quantity * lastRate) / quantity;
}
export function getStickerPrice(quantity, config, sizeMultiplier = 1, materialMultiplier = 1) {
    const rate = getBasePrice(quantity, config);
    const baseTotal = roundMoney(rate * quantity);
    const sizedTotal = roundMoney(rate * sizeMultiplier * quantity);
    // Preserve the storefront's existing rounding and multiplication order so
    // preset quotes do not change by a cent at half-cent boundaries.
    const subtotal = roundMoney(rate * materialMultiplier * sizeMultiplier * quantity);
    return {
        baseTotal,
        sizeAdjustment: roundMoney(sizedTotal - baseTotal),
        materialAdjustment: roundMoney(subtotal - sizedTotal),
        subtotal,
    };
}
export function formatPriceAdjustment(amount) {
    return `${amount < 0 ? '−' : '+'}$${Math.abs(amount).toFixed(2)}`;
}
