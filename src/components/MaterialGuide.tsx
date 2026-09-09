import { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '@/lib/analytics'
import bottlePhoto from '@/assets/projects/drive-bottle-labels.jpg'
import holographicPhoto from '@/assets/projects/stickers-holographic.jpg'

const materialGuide = [
  { value: 'Matte Vinyl', label: 'Matte vinyl', appearance: 'A soft, low-shine look that keeps the artwork easy to read.', use: 'Brand artwork, packaging and illustrated designs.', care: 'Tell us about water, sun or heavy handling so we can confirm the right stock and finish.' },
  { value: 'Glossy Vinyl', label: 'Gloss vinyl', appearance: 'A shiny surface with reflections that change as you tilt it.', use: 'Bold colors, photography and bright product labels.', care: 'Surface preparation and the selected laminate affect how it performs.' },
  { value: 'Clear', label: 'Clear', appearance: 'The unprinted background lets the surface underneath show through.', use: 'Windows, jars and containers where you want less visible background.', care: 'White ink and your container color affect the result. We’ll review these in the proof.' },
  { value: 'Holographic', label: 'Holographic', appearance: 'A reflective rainbow base that changes with the light.', use: 'Special drops, accents and eye-catching brand stickers.', care: 'Ink coverage changes how much rainbow shows. Ask about white ink placement.' },
  { value: 'Paper', label: 'Paper', appearance: 'An economical paper-based label for dry applications.', use: 'Indoor packaging, short-term labels and dry goods.', care: 'Choose for dry use. Do not assume paper is waterproof or suitable for outdoor exposure.' },
  { value: 'Embossed/UV', label: 'Raised / UV', appearance: 'A dimensional or spot-finish effect on selected areas.', use: 'Special details, logos and premium packaging.', care: 'Ask us to confirm the available process, stock and artwork requirements before ordering.' },
]

export default function MaterialGuide({ value, onSelect }: { value: string; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = materialGuide.find(item => item.value === value) || materialGuide[0]
  return (
    <div className="col-span-full rounded-2xl border border-border bg-card p-5 md:p-6 text-sm">
      <div className="grid md:grid-cols-[1fr_280px] gap-5 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Your finish, explained</p>
          <h3 className="font-bold text-xl">{selected.label}</h3>
          <p className="mt-2 text-muted-foreground">{selected.appearance}</p>
          <p className="mt-2 text-muted-foreground">Works well for: {selected.use}</p>
          <p className="mt-2 text-xs text-muted-foreground">{selected.care}</p>
          <button type="button" aria-expanded={open} aria-controls="finish-comparison" className="mt-4 text-primary font-bold" onClick={() => { setOpen(!open); if (!open) trackEvent('material_compare_open') }}>{open ? 'Close comparison' : 'Compare all finishes'}</button>
        </div>
        <figure>
          <img src={value === 'Holographic' ? holographicPhoto : bottlePhoto} alt={value === 'Holographic' ? 'Real Flight Risk holographic print run' : 'Sticker Smith labels applied to bottles'} loading="lazy" className="w-full rounded-lg aspect-[16/10] object-cover" />
          <figcaption className="text-[11px] text-muted-foreground mt-2">{value === 'Holographic' ? 'Real holographic print example.' : 'Shop bottle-label project. Exact stock and finish are not recorded for this photo.'}</figcaption>
        </figure>
      </div>
      {open && <div id="finish-comparison" className="mt-5 border-t border-border pt-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {materialGuide.map(item => <button key={item.value} type="button" aria-pressed={value === item.value} onClick={() => onSelect(item.value)} className={`block w-full rounded-xl border p-4 text-left ${value === item.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
            <span className="font-bold block">{item.label}</span><span className="block mt-2 text-xs text-muted-foreground">{item.appearance}</span><span className="block mt-2 text-xs text-muted-foreground">{item.use}</span>
          </button>)}
        </div>
        <Link className="text-primary text-xs font-bold block mt-4" to="/contact?service=Sticker%20samples&message=Can%20I%20see%20samples%20of%20your%20available%20sticker%20materials%3F">Ask about physical material samples →</Link>
      </div>}
    </div>
  )
}
