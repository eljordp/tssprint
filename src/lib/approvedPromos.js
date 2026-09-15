export const DEFAULT_PROMOS = Object.freeze({
  AUTO10: {
    type: "percent",
    value: 10,
    minOrder: 35,
    active: true,
    firstOrderOnly: true,
  },
  WELCOME15: {
    type: "percent",
    value: 15,
    minOrder: 50,
    active: true,
    firstOrderOnly: true,
  },
  FIRST10: {
    type: "fixed",
    value: 10,
    minOrder: 50,
    active: true,
    firstOrderOnly: true,
  },
});
export function validatePromos(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length > 100
  )
    throw new Error("Invalid discount settings.");
  const result = Object.create(null);
  for (const [code, promo] of Object.entries(value)) {
    if (
      !/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(code) ||
      !promo ||
      !["percent", "fixed"].includes(promo.type) ||
      !Number.isFinite(promo.value) ||
      promo.value <= 0 ||
      (promo.type === "percent" && promo.value > 100) ||
      !Number.isFinite(promo.minOrder) ||
      promo.minOrder < 0 ||
      typeof promo.active !== "boolean" ||
      typeof promo.firstOrderOnly !== "boolean" ||
      (promo.expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(promo.expiresAt))
    )
      throw new Error("Check the code, discount, minimum and expiration date.");
    result[code] = {
      type: promo.type,
      value: promo.value,
      minOrder: promo.minOrder,
      active: promo.active,
      firstOrderOnly: promo.firstOrderOnly,
      ...(promo.expiresAt ? { expiresAt: promo.expiresAt } : {}),
    };
  }
  return result;
}
