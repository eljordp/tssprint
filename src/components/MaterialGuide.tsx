import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import mattePhoto from '@/assets/optimized/materials/matte-vinyl-reference.webp'
import glossPhoto from '@/assets/optimized/materials/gloss-vinyl-reference.webp'
import clearPhoto from '@/assets/optimized/materials/clear-vinyl-reference.webp'
import paperPhoto from '@/assets/optimized/materials/paper-label-reference.webp'
import raisedPhoto from '@/assets/optimized/materials/raised-uv-reference.webp'
import comparisonPhoto from '@/assets/optimized/materials/matte-gloss-comparison-reference.webp'
import holographicPhoto from '@/assets/optimized/projects/stickers-holographic-1000.webp'

const finishSource = 'https://www.standoutstickers.com/faq/matte-vs-glossy-stickers'
const materialGuide = [
  { value: 'Matte Vinyl', label: 'Matte vinyl', cue: 'Soft finish · low glare', appearance: 'A soft, low-shine look that keeps the artwork easy to read.', use: 'Brand artwork, packaging and illustrated designs.', care: 'Tell us about water, sun or heavy handling so we can confirm the right stock and finish.', image: mattePhoto, alt: 'Photographed black matte labels with soft, diffused light across the surface', photoNote: 'Look for the soft reflection across the black ink.', position: '60% center', source: 'StandOut Stickers', sourceUrl: finishSource },
  { value: 'Glossy Vinyl', label: 'Gloss vinyl', cue: 'Shiny finish · visible reflections', appearance: 'A shiny surface with reflections that change as you tilt it.', use: 'Bold colors, photography and bright product labels.', care: 'Surface preparation and the selected laminate affect how it performs.', image: glossPhoto, alt: 'Photographed red and black glossy stickers reflecting bright light', photoNote: 'The bright reflections show the glossy laminate.', position: '78% center', source: 'StandOut Stickers', sourceUrl: finishSource },
  { value: 'Clear', label: 'Clear', cue: 'See-through background', appearance: 'The unprinted background lets the surface underneath show through.', use: 'Windows, jars and containers where you want less visible background.', care: 'White ink and your container color affect the result. We’ll review these in the proof.', image: clearPhoto, alt: 'A real clear sticker held between fingers, with the fingers visible through unprinted areas', photoNote: 'You can see the hand through the unprinted areas.', position: 'center 60%', source: 'StickerApp', sourceUrl: 'https://stickerapp.com/blog/sticker-academy/materials-and-laminates-how-to-make-stickers' },
  { value: 'Holographic', label: 'Holographic', cue: 'Reflective rainbow base', appearance: 'A reflective rainbow base that changes with the light.', use: 'Special drops, accents and eye-catching brand stickers.', care: 'Ink coverage changes how much rainbow shows. Ask about white ink placement.', image: holographicPhoto, alt: 'Real Flight Risk holographic print run from The Sticker Smith', photoNote: 'Real shop print: the rainbow base catches the light.', position: 'center', source: 'The Sticker Smith', sourceUrl: '/projects?project=stickers-holographic' },
  { value: 'Paper', label: 'Paper', cue: 'Paper label · dry applications', appearance: 'A paper-based label for dry packaging and everyday labeling.', use: 'Indoor packaging, short-term labels and dry goods.', care: 'Choose for dry use. Ask the shop about the available paper color and coating.', image: paperPhoto, alt: 'Photographed white paper label applied to a candle jar', photoNote: 'White matte paper shown on a candle label.', position: 'center', source: 'OnlineLabels', sourceUrl: 'https://www.onlinelabels.com/materials/white-matte-labels' },
  { value: 'Embossed/UV', label: 'Raised / UV', cue: 'Raised detail · selective shine', appearance: 'A dimensional or spot-finish effect on selected areas.', use: 'Special details, logos and premium packaging.', care: 'Ask us to confirm the available process, stock and artwork requirements before ordering.', image: raisedPhoto, alt: 'A photographed sticker with raised glossy details catching light on the printed design', photoNote: 'Raised spot UV shown; shine sits on selected details.', position: '70% center', source: 'Car Stickers', sourceUrl: 'https://www.carstickers.com/products/stickers/custom-stickers/setup/embossed-stickers/' },
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
          <button type="button" aria-expanded={open} aria-controls="finish-comparison" className="mt-4 min-h-11 text-primary font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4" onClick={() => { setOpen(!open); if (!open) trackEvent('material_compare_open') }}>{open ? 'Close comparison' : 'Compare all finishes'}</button>
        </div>
        <figure>
          <img src={selected.image} alt={selected.alt} width={560} height={420} loading="lazy" className="w-full rounded-lg aspect-[4/3] object-cover bg-black" style={{ objectPosition: selected.position }} />
          <figcaption className="text-[11px] leading-relaxed text-muted-foreground mt-2">
            <span className="block">{selected.photoNote}</span>
            <a href={selected.sourceUrl} target={selected.sourceUrl.startsWith('https:') ? '_blank' : undefined} rel={selected.sourceUrl.startsWith('https:') ? 'noopener noreferrer' : undefined} className="underline underline-offset-2">Photo: {selected.source}</a>
          </figcaption>
        </figure>
      </div>
      {open && <div id="finish-comparison" className="mt-5 border-t border-border pt-5">
        <h4 className="font-bold text-base">See the difference</h4>
        <p className="mt-1 mb-4 text-xs text-muted-foreground">Photographed finish examples. Artwork and stock vary; ask us for a shop sample to check the final feel.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {materialGuide.map(item => <div key={item.value} className={`rounded-xl overflow-hidden border ${value === item.value ? 'border-primary bg-primary/10' : 'border-border'}`}>
            <button type="button" aria-label={`Use ${item.label}`} aria-pressed={value === item.value} onClick={() => onSelect(item.value)} className="block w-full text-left hover:bg-primary/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
              <img src={item.image} alt={item.alt} width={420} height={315} loading="lazy" className="w-full aspect-[4/3] object-cover bg-black" style={{ objectPosition: item.position }} />
              <span className="block p-3 min-h-24">
                <span className="font-bold flex items-center gap-1.5">{item.label}{value === item.value && <Check size={15} aria-hidden="true" className="text-primary shrink-0" />}</span>
                <span className="block mt-1 text-xs text-muted-foreground">{item.cue}</span>
              </span>
            </button>
            <a href={item.sourceUrl} target={item.sourceUrl.startsWith('https:') ? '_blank' : undefined} rel={item.sourceUrl.startsWith('https:') ? 'noopener noreferrer' : undefined} className="block px-3 pb-3 text-[10px] text-muted-foreground underline underline-offset-2">Photo: {item.source}</a>
          </div>)}
        </div>
        <figure className="mt-5 rounded-xl border border-border p-3">
          <figcaption className="font-bold mb-3">Same design: gloss vs. matte</figcaption>
          <img src={comparisonPhoto} alt="The same pointing-hand sticker photographed in glossy finish on the left and matte finish on the right" width={1200} height={722} loading="lazy" className="w-full h-auto rounded-lg" />
          <p className="text-xs text-muted-foreground mt-3">Compare the bright reflection on the left with the soft finish on the right. <a href="https://www.jukeboxprint.com/blog/glossy-vs-matte-stickers" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Photo: Jukebox</a></p>
        </figure>
        <Link className="text-primary text-xs font-bold block mt-4 py-2" to="/contact?service=Sticker%20samples&message=Can%20I%20see%20samples%20of%20your%20available%20sticker%20materials%3F">Ask about physical material samples →</Link>
      </div>}
    </div>
  )
}
