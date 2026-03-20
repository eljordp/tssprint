import { useState, type FormEvent } from 'react'
import { Send, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const services = [
  'Stickers & Labels',
  'Vehicle Graphics',
  'Business Signage',
  'Event Displays',
  'Mylar Packaging',
  'Business Print',
  'Other',
]

export default function QuickContact() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      formData.phone ? `Phone: ${formData.phone}` : '',
      formData.service ? `Service: ${formData.service}` : '',
      '',
      formData.message,
    ].filter(Boolean).join('\n')

    const mailtoUrl = `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent(
      'Quick Question'
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="py-16 md:py-24 bg-card/30">
        <div className="section-container text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Message sent!</h3>
          <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-card/30 border-t border-border/50">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Have a Question?
            </h2>
            <p className="text-muted-foreground text-lg">
              Drop us a quick message or request a free quote
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="px-5 py-3.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a Service</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="What do you need?"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="md:col-span-2 px-5 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button type="submit" className="btn-primary px-8 py-3.5">
                Send Message
                <Send size={18} />
              </button>
              <Link to="/contact" className="btn-secondary px-8 py-3.5">
                Full Contact Form
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
