import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'

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
      <section className="py-12 bg-background">
        <div className="section-container text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Message sent!</h3>
          <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold">
            Have a <span className="text-primary">Question?</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Drop us a quick message and we'll get back to you ASAP</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 max-w-5xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-3">
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="flex-1 px-4 py-3 rounded-full border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
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
              className="flex-[2] px-4 py-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="submit"
              className="btn-primary px-6 py-3 whitespace-nowrap rounded-full"
            >
              Send
              <Send size={18} />
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}
