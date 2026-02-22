import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function QuickContact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Get a Quick Quote</h2>
            <p className="mt-3 text-muted-foreground">
              Tell us about your project and we'll get back to you same day.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {submitted ? (
            <div className="bg-card border border-primary/30 rounded-xl p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
              <p className="text-muted">We'll get back to you within a few hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">What do you need?</label>
                <textarea
                  rows={3}
                  required
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
