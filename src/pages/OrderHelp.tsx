import { Link } from 'react-router-dom'

export default function OrderHelp() {
  return <section className="section-container max-w-3xl py-12 space-y-6">
    <h1 className="text-3xl font-black">Proofs, delivery & order help</h1>
    <div><h2 className="text-xl font-bold">Before we print</h2><p className="mt-2 text-muted-foreground">Review your digital proof for spelling, size, layout and cut lines. Printing begins after you approve it. Let us know about any material requirements, outdoor use or deadlines before approval.</p></div>
    <div><h2 className="text-xl font-bold">Production and delivery</h2><p className="mt-2 text-muted-foreground">Production time starts after artwork and proof approval. A production estimate does not include delivery time. Ask the shop to confirm availability for rush work or a specific event date.</p></div>
    <div><h2 className="text-xl font-bold">Hayward pickup</h2><p className="mt-2 text-muted-foreground">Select pickup at checkout. Wait for your ready-for-pickup message before visiting 23673 Connecticut St, Hayward, CA 94545.</p></div>
    <div><h2 className="text-xl font-bold">Changes or a problem with your order?</h2><p className="mt-2 text-muted-foreground">Contact the shop with your order number as soon as possible. Include photos if the print or shipment has a problem. The team will review what happened and explain the available next steps. Changes after production starts need review.</p></div>
    <div className="flex flex-wrap gap-4"><a className="btn-primary" href="mailto:thestickersmith@gmail.com">Email the shop</a><a className="btn-secondary" href="tel:+15106348203">(510) 634-8203</a><Link className="text-primary self-center" to="/contact">Ask about your project</Link></div>
  </section>
}
