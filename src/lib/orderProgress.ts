/** Describe only the recorded state; payment never implies proof approval. */
export function orderProgress(status: string) {
  switch (status) {
    case 'processing':
      return { label: 'Order received', detail: 'Check your email for artwork questions or your proof. This status does not confirm proof approval or that printing has started.' }
    case 'shipped':
      return { label: 'Shipped', detail: 'Check your shipping email for the carrier and tracking link. Contact the shop if it has not arrived.' }
    case 'completed':
      return { label: 'Completed', detail: 'The shop has marked this order complete. For pickup, follow the ready-for-pickup message before visiting.' }
    default:
      return { label: 'Contact shop for status', detail: 'We do not have a recognized progress update for this order. Contact the shop with your order reference.' }
  }
}

export function orderSupportLink(orderId: string) {
  return `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent(`Order ${orderId} — artwork, proof or status question`)}`
}
