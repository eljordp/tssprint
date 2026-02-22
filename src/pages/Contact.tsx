import { useState, type FormEvent } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

const serviceOptions = [
  'Custom Stickers',
  'Vehicle Graphics',
  'Business Signage',
  'Event Canopies',
  'Mylar Packaging',
  'Window Film',
  'Business Print',
  'Other',
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.phone ? `Phone: ${form.phone}` : '',
      `Service: ${form.service}`,
      '',
      form.message,
    ].filter(Boolean).join('\n')

    const mailtoUrl = `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent(
      `Quote Request — ${form.service}`
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailtoUrl
    setSubmitted(true)
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold">Contact Us</h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Ready to start your project? Get in touch for a free quote. Same-day responses, proof within 24 hours.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.1}>
              {submitted ? (
                <div className="bg-card border border-primary/30 rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Thanks for reaching out. We'll review your project details and get back to you within a few hours with a quote.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Full Name *</label>
                      <input
                        required
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        placeholder="(510) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1.5">Service Type *</label>
                      <select
                        required
                        value={form.service}
                        onChange={(e) => handleChange('service', e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                      >
                        <option value="">Select a service</option>
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Project Details *</label>
                    <textarea
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your project – sizes, quantities, materials, timeline..."
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Have artwork files? Mention it above and we'll reply with a link to upload them securely.
                  </p>

                  <Button type="submit" className="w-full" size="lg">
                    Send Message
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </FadeIn>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-4">
            <FadeIn delay={0.15}>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Get In Touch</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="tel:+15106348203" className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground font-medium">Phone</p>
                        <p>(510) 634-8203</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:thestickersmith@gmail.com" className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground font-medium">Email</p>
                        <p>thestickersmith@gmail.com</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="https://maps.google.com/?q=23673+Connecticut+St+Hayward+CA+94545" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p className="text-foreground font-medium">Address</p>
                        <p>23673 Connecticut St.<br />Hayward, CA 94545</p>
                        <p className="text-xs text-primary mt-1">View on Google Maps &rarr;</p>
                      </div>
                    </a>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">Hours</p>
                      <p>Mon – Sat: 9am – 6pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">Response Time</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Proof within 24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Quotes same day
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Local pickup available
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
