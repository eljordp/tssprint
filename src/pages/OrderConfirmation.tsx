import { orderSupportLink } from '@/lib/orderProgress'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Package, Mail, FileImage } from 'lucide-react'

export default function OrderConfirmation() {
  const location = useLocation()
  const { orderId, payerName, email, total, processingIssue } = location.state || {}
  const needsManualReview = Boolean(processingIssue)
  const thanks = payerName ? `Thank you, ${payerName}!` : 'Thank you!'

  if (!orderId) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">Find your order</h1>
          <p className="text-muted-foreground mb-8">This page needs the checkout reference. Check your confirmation email or sign in with the email used for your order.</p>
          <Link to="/account" className="btn-primary">View my orders</Link>
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
            ? `${thanks} Your payment was received. Our team needs to check the order details or confirmation email. Please keep your payment reference and contact us if you need an update.`
            : `${thanks} Your payment went through and your order was recorded. Nothing prints until your artwork is ready and the proof is approved.`}
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
              <p className="font-bold">Order / payment reference</p>
              <p className="text-muted-foreground text-sm break-all">{orderId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Confirmation Email</p>
              <p className="text-muted-foreground text-sm">
                {needsManualReview
                  ? <>An order confirmation may not have been sent to <span className="text-foreground">{email}</span>. Email us with the reference above so we can match your payment.</>
                  : <>We sent an order confirmation to <span className="text-foreground">{email}</span>. If it hasn&apos;t arrived in a few minutes, check spam or contact us with the reference above.</>}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileImage size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">What happens next</p>
              <ol className="text-muted-foreground text-sm list-decimal pl-4 space-y-1 mt-1">
                <li>If you uploaded artwork, we&apos;ll check it. If you chose to send it later or asked for design help, email it or your notes to us with the reference above.</li>
                <li>We&apos;ll email your production proof. Review the spelling, size, layout and cut lines, then reply to that email with approval or the changes you need.</li>
                <li>Production starts only after you approve the proof. We&apos;ll email you when it ships or is ready for pickup.</li>
              </ol>
            </div>
          </div>
          <div className="border-t border-border pt-4 flex justify-between items-center">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-black text-primary">${total}</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          {needsManualReview ? 'Keep the reference above handy. ' : 'Keep the reference above for your records. '}
          If you have any questions, reach out to us at{' '}
          <a href={orderSupportLink(orderId)} className="text-primary hover:underline">
            thestickersmith@gmail.com
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/account" className="btn-primary">View my orders</Link>
          <a href={orderSupportLink(orderId)} className="btn-secondary">Send artwork or ask a question</a>
        </motion.div>
      </div>
    </section>
  )
}
