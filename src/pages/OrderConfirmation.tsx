import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Package, Mail } from 'lucide-react'

export default function OrderConfirmation() {
  const location = useLocation()
  const { orderId, payerName, email, total, processingIssue } = location.state || {}
  const needsManualReview = Boolean(processingIssue)

  if (!orderId) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">No Order Found</h1>
          <p className="text-muted-foreground mb-8">It looks like you navigated here directly.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          {needsManualReview ? <AlertTriangle size={32} /> : <CheckCircle size={32} />}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black mb-4"
        >
          Payment received
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground mb-8"
        >
          {needsManualReview
            ? `Thank you, ${payerName}! Your payment went through. Our team is reviewing the order details manually.`
            : `Thank you, ${payerName}! Your payment went through. Next, we’ll check your artwork and prepare your proof.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 mb-8 text-left space-y-4"
        >
          <div className="flex items-start gap-3">
            <Package size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Order ID</p>
              <p className="text-muted-foreground text-sm break-all">{orderId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Confirmation Email</p>
              <p className="text-muted-foreground text-sm">
                {needsManualReview
                  ? <>We are checking the confirmation for <span className="text-foreground">{email}</span>.</>
                  : <>Your receipt and proof updates go to <span className="text-foreground">{email}</span></>}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-black text-primary">${total}</span>
          </div>
        </motion.div>

        <div className="mb-8 rounded-2xl border border-border bg-card p-5 text-left">
          <h2 className="font-bold mb-3">What happens next</h2>
          <ol className="space-y-3 text-sm text-muted-foreground list-decimal pl-5">
            <li><strong className="text-foreground">Artwork check.</strong> We review your file, or contact you if artwork is still needed.</li>
            <li><strong className="text-foreground">Your approval.</strong> We send a digital proof for you to review.</li>
            <li><strong className="text-foreground">Production.</strong> Printing starts after proof approval.</li>
            <li><strong className="text-foreground">Shipping or pickup.</strong> We send tracking or a ready-for-pickup message when available.</li>
          </ol>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          Keep this order ID handy. Nothing prints until you approve the production proof.
          If you have any questions, reach out to us at{' '}
          <a href="mailto:thestickersmith@gmail.com" className="text-primary hover:underline">
            thestickersmith@gmail.com
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/stickers" className="btn-secondary">Order More Stickers</Link>
        </motion.div>
      </div>
    </section>
  )
}
