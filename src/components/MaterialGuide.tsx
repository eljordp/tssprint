import ResponsiveImage from '@/components/ResponsiveImage'
import { useId, useState } from 'react'
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

// A display crop preserves the photographed finish; it does not simulate material effects.
function SelectedVinylPhoto({ matte }: { matte: boolean }) {
  const clipId = useId()
  const edge = '607,0 607,100 598,125 680,210 700,275 613,357 551,415 520,460 520,722'
  return <svg role="img" aria-label={`The same sticker design in ${matte ? 'matte' : 'gloss'} vinyl`} viewBox={matte ? '480 0 720 690' : '0 0 720 690'} className="w-full h-44 rounded-lg">
    <defs><linearGradient id={`${clipId}-background`} x1="0" x2="1200" gradientUnits="userSpaceOnUse"><stop stopColor="#01a3da" /><stop offset="1" stopColor="#00aee1" /></linearGradient><clipPath id={clipId}><polygon points={matte ? `${edge} 1200,722 1200,0` : `0,0 ${edge} 0,722`} /></clipPath></defs>
    <rect width="1200" height="722" fill={`url(#${clipId}-background)`} />
    <image href={comparisonPhoto} width="1200" height="722" clipPath={`url(#${clipId})`} />
  </svg>
}

export default function MaterialGuide({ value, onSelect, layout = 'compact' }: { value: string; onSelect: (value: string) => void; layout?: 'compact' | 'classic' }) {
  const [open, setOpen] = useState(false)
  const selected = materialGuide.find(item => item.value === value) || materialGuide[0]
  const classic = layout === 'classic'
  const isVinyl = value === 'Matte Vinyl' || value === 'Glossy Vinyl'
  return (
    <fieldset className="min-w-0 text-sm">
      <legend className={classic ? "text-sm font-black uppercase tracking-wider mb-3" : "font-bold mb-2"}>Material</legend>
      <div className={classic ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2"}>
        {materialGuide.map(item => <button key={item.value} type="button" aria-label={`Use ${item.label}`} aria-pressed={value === item.value} onClick={() => onSelect(item.value)} className={`min-h-11 rounded-lg border px-2 ${classic ? 'py-3' : 'py-2'} text-sm font-semibold flex items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${value === item.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
          {item.label}{value === item.value && <Check size={14} aria-hidden="true" className="shrink-0" />}
        </button>)}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{selected.cue}</p>
      <figure className="mt-3">
        {classic && isVinyl ? <SelectedVinylPhoto matte={value === 'Matte Vinyl'} /> : <ResponsiveImage src={isVinyl ? comparisonPhoto : selected.image} alt={isVinyl ? 'The same sticker: glossy on the left, matte on the right' : selected.alt} width={isVinyl ? 1200 : 560} height={isVinyl ? 722 : 420} loading="lazy" className="w-full h-40 sm:h-44 object-contain rounded-lg bg-black/20" />}
        <figcaption className="text-[11px] text-muted-foreground mt-1 flex flex-wrap justify-between gap-1">
          <span>{isVinyl ? (classic ? `${value === 'Matte Vinyl' ? 'Matte' : 'Gloss'} vinyl · photographed sample` : 'Same design · gloss vs. matte') : selected.photoNote}</span>
          <a href={isVinyl ? 'https://www.jukeboxprint.com/blog/glossy-vs-matte-stickers' : selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Photo: {isVinyl ? 'Jukebox' : selected.source}</a>
        </figcaption>
      </figure>
      <button type="button" aria-expanded={open} aria-controls="finish-comparison" className="min-h-11 text-xs text-primary font-semibold underline underline-offset-4" onClick={() => { setOpen(!open); if (!open) trackEvent('material_compare_open') }}>{open ? 'Hide material details' : 'Material details & samples'}</button>
      {open && <div id="finish-comparison" className="rounded-xl border border-border p-3 text-xs text-muted-foreground space-y-2">
        <p>{selected.appearance} Works well for: {selected.use}</p>
        <p>{selected.care}</p>
        <p>Photographed references; exact stock can vary.</p>
        <Link className="text-primary font-semibold block py-2" to="/contact?service=Sticker%20samples&message=Can%20I%20see%20samples%20of%20your%20available%20sticker%20materials%3F">Ask about physical material samples →</Link>
      </div>}
    </fieldset>
  )
}
