import { Link } from 'react-router-dom'

export default function OrderHelp() {
  return <section className="section-container max-w-3xl py-12 space-y-6">
    <h1 className="text-3xl font-black">Proofs, delivery & order help</h1>
    <div><h2 className="text-xl font-bold">Before we print</h2><p className="mt-2 text-muted-foreground">Your on-screen artwork preview is for placement; it is not your production proof. The shop emails the proof after reviewing your file. Check spelling, dimensions, layout, cut lines and the requested material. Reply to that proof email with your approval or a clear list of changes. Review the revised proof before approving. Printing begins after approval.</p></div>
    <div><h2 className="text-xl font-bold">Waiting for a proof or an update?</h2><p className="mt-2 text-muted-foreground">Check the inbox and spam folder for the email you used at checkout. If you chose to send artwork later, email your file and order reference to the shop. Your account’s “Order received” status does not mean the proof is approved or printing has started. Ask the shop if the next step is unclear.</p><Link to="/account" className="inline-block mt-3 text-primary font-semibold">View my orders →</Link></div>
    <div><h2 className="text-xl font-bold">Production and delivery</h2><p className="mt-2 text-muted-foreground">Production time starts after artwork and proof approval. A production estimate does not include delivery time. Ask the shop to confirm availability for rush work or a specific event date.</p></div>
    <div><h2 className="text-xl font-bold">Hayward pickup</h2><p className="mt-2 text-muted-foreground">Select pickup at checkout. Wait for your ready-for-pickup message before visiting 23673 Connecticut St, Hayward, CA 94545.</p></div>
    <div><h2 className="text-xl font-bold">Changes or a problem with your order?</h2><p className="mt-2 text-muted-foreground">Contact the shop with your order number as soon as possible. Include photos if the print or shipment has a problem. The team will review what happened and explain the available next steps. Changes after production starts need review.</p></div>
    <div className="flex flex-wrap gap-4"><a className="btn-primary" href="mailto:thestickersmith@gmail.com">Email the shop</a><a className="btn-secondary" href="tel:+15106348203">(510) 634-8203</a><Link className="text-primary self-center" to="/contact">Ask about your project</Link></div>
  </section>
}
