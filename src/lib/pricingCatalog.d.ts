export interface AddOn {
    name: string;
    type: 'multiplier' | 'flat';
    value: number;
}
export interface ProductTier {
    size: string;
    quantities: {
        qty: number;
        price: number;
    }[];
}
export interface ProductCategory {
    name: string;
    items: ProductTier[];
    addOns: AddOn[];
}
export interface SizeMultiplier {
    name: string;
    multiplier: number;
}
export interface PricingConfig {
    basePrices: {
        maxQty: number;
        price: number;
    }[];
    sizeMultipliers: SizeMultiplier[];
    materialMultipliers: {
        name: string;
        multiplier: number;
    }[];
    stickerAddOns: AddOn[];
    products: ProductCategory[];
}
export declare const defaultPricing: PricingConfig;
export declare function normalizePricingConfig(input: unknown): PricingConfig;
