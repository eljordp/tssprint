export declare const STICKER_QUANTITIES: number[];
export declare const MIN_STICKER_QUANTITY = 50;
export declare const MIN_ORDER_SUBTOTAL = 35;
export declare const defaultStickerBasePrices: {
    maxQty: number;
    price: number;
}[];
type BasePricing = {
    basePrices: {
        maxQty: number;
        price: number;
    }[];
};
export declare function isValidStickerQuantity(quantity: number): boolean;
/** Interpolate order totals, preserving the configured preset prices.
 * The open-ended tier is anchored at the final storefront preset (2,500).
 * Beyond that anchor its per-piece rate applies. Never discount earlier
 * pieces retroactively when a customer adds one more sticker.
 */
export declare function getBasePrice(quantity: number, config: BasePricing): number;
export declare function getStickerPrice(quantity: number, config: BasePricing, sizeMultiplier?: number, materialMultiplier?: number): {
    baseTotal: number;
    sizeAdjustment: number;
    materialAdjustment: number;
    subtotal: number;
};
export declare function formatPriceAdjustment(amount: number): string;
export {};
