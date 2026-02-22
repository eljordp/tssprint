import { Upload, FileCheck, ThumbsUp, Truck } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'

const steps = [
  {
    icon: Upload,
    title: 'Upload',
    description: 'Send us your artwork or describe your vision. We accept all file formats.',
  },
  {
    icon: FileCheck,
    title: 'Proof',
    description: 'We create a digital proof within 24 hours for your review.',
  },
  {
    icon: ThumbsUp,
    title: 'Approve',
    description: 'Review your proof, request revisions if needed, then approve to print.',
  },
  {
    icon: Truck,
    title: 'Deliver',
    description: 'We print and ship or prepare for local pickup in Hayward, CA.',
  },
]

export default function ProofProcess() {
  return (
    <section className="py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Simple 4-step process from concept to delivery.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.15}>
              <div className="relative text-center">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-primary text-primary text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </div>

                <div className="bg-card border border-border rounded-xl p-6 pt-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-border" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
