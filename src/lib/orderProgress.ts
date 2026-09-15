/** Describe only the recorded state; payment never implies proof approval. */
export function orderProgress(status: string) {
  switch (status) {
    case 'processing':
      return { label: 'Order received', detail: 'We’ll contact you by email about artwork and the next steps for your order. Reply to the shop’s email with any questions.' }
    case 'artwork_needed': return { label: 'Artwork needed', detail: 'Send your production artwork to the shop with your order reference.' }
    case 'artwork_review': return { label: 'Artwork under review', detail: 'The shop is reviewing your artwork before preparing a proof.' }
    case 'awaiting_approval': return { label: 'Awaiting proof approval', detail: 'Review the proof sent by the shop and reply with approval or changes.' }
    case 'in_production': return { label: 'In production', detail: 'The shop has marked your order as in production.' }
    case 'ready_pickup': return { label: 'Ready for pickup', detail: 'Follow the shop’s pickup instructions before visiting.' }
    case 'cancelled': return { label: 'Cancelled', detail: 'Contact the shop about any payment or refund questions.' }
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
