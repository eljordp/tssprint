import { motion } from 'framer-motion'
import { FileCheck, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  { icon: FileCheck, label: 'Upload your design' },
  { icon: Clock, label: '24hr digital proof' },
  { icon: CheckCircle, label: 'Approve & we print' },
]

export default function ProofProcess() {
  return (
    <section className="py-8 border-t border-b border-border">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
        >
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              )}
            </div>
          ))}
          <Link to="/order" className="btn-primary text-sm px-5 py-2 ml-0 sm:ml-4">
            Start Now
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
