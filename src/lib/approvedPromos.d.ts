export type ApprovedPromo = {
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
  firstOrderOnly: boolean;
  expiresAt?: string;
};
export const DEFAULT_PROMOS: Record<string, ApprovedPromo>;
export function validatePromos(value: unknown): Record<string, ApprovedPromo>;
