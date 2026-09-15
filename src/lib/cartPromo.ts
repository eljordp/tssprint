import type { PromoResult } from './promoCodes'

export function resolveCartPromo({ ready, subtotal, requestedCode, automaticCode, allowAutomatic, validate }: {
  ready: boolean
  subtotal: number
  requestedCode: string | null
  automaticCode: string
  allowAutomatic: boolean
  validate: (code: string, subtotal: number) => PromoResult
}) {
  const empty = { code: null, discount: 0, label: null }
  if (!ready) return empty
  const candidates = [requestedCode, allowAutomatic ? automaticCode : null].filter((code): code is string => Boolean(code))
  for (const candidate of candidates) {
    const result = validate(candidate, subtotal)
    if (result.valid && result.code && result.discount !== undefined) {
      return {
        code: result.code.code,
        discount: result.discount,
        label: result.code.type === 'percent' ? `${result.code.value}% off` : `$${result.code.value} off`,
      }
    }
  }
  return empty
}
