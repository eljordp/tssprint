import { motion } from 'framer-motion'
import { CheckCircle, FileCheck, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    icon: FileCheck,
    title: 'Upload Your Design',
    description: 'Share your artwork or idea. We accept PNG, JPG, PDF, and vector files.',
  },
  {
    icon: Clock,
    title: 'Get Your Proof',
    description: "Within 24 hours, you'll receive a digital proof showing exactly how your order will look.",
  },
  {
    icon: CheckCircle,
    title: 'Approve & Produce',
    description: 'Once you approve, we print and prepare your order for local pickup or delivery.',
  },
]

export default function ProofProcess() {
  return (
    <section className="pt-12 pb-12 md:pt-16 md:pb-16">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="mb-4">Proof-Based Printing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            You approve before we produce. Every order includes a digital proof so you know exactly what you're getting.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-elevated text-center relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-px bg-border" />
              )}

              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
                <step.icon size={28} className="text-primary" />
              </div>
              <div className="text-sm text-primary font-medium mb-2">Step {index + 1}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link to="/contact" className="btn-primary">
            Start My Project
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
