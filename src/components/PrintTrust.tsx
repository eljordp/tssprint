import ResponsiveImage from '@/components/ResponsiveImage'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { projects, type Project } from '@/lib/projects'
import ProjectModal from './ProjectModal'

export default function PrintTrust() {
  const [selected, setSelected] = useState<Project | null>(null)
  const examples = projects.filter(project => project.category === 'Stickers').slice(0, 3)
  return <aside className="rounded-2xl border border-border bg-card p-4 my-5">
    <p className="font-bold text-sm">Printed here. Proofed with you.</p>
    <p className="text-xs text-muted-foreground mt-2">Approve your digital proof before printing. Choose shipping or pickup at 23673 Connecticut St, Hayward.</p>
    <div className="grid grid-cols-3 gap-2 mt-3">{examples.map(project => <button key={project.slug} type="button" onClick={() => setSelected(project)} aria-label={`View ${project.title}`} className="text-left rounded-lg overflow-hidden border border-border"><ResponsiveImage sizes="(min-width: 768px) 160px, 30vw" src={project.image} alt="" className="aspect-square w-full object-cover" loading="lazy" /><span className="block p-2 text-[11px] font-semibold">{project.title}</span></button>)}</div>
    <div className="flex flex-wrap gap-4 mt-3 text-xs font-bold text-primary"><a href="tel:+15106348203">Call the shop</a><a href="https://share.google/N0wDi6Y8eFK5EaR5v" target="_blank" rel="noreferrer">Read Google reviews</a><Link to="/order-help">Proofs, delivery & order help</Link></div>
    <ProjectModal project={selected} onClose={() => setSelected(null)} />
  </aside>
}
