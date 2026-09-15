import { Link } from 'react-router-dom'

import dieCutCategory from '@/assets/optimized/projects/drive-magdre-die-cut-stacks.webp'
import stickerSheetsCategory from '@/assets/projects/stickers-sheet.jpg'
import samplePacksCategory from '@/assets/optimized/projects/stickers-holographic-1000.webp'
import labelsRollCategory from '@/assets/optimized/projects/stickers-roll-1000.webp'
import customLabelsCategory from '@/assets/optimized/projects/drive-bottle-labels-1000.webp'

const categories = [
  {
    title: 'Die-Cut',
    description: 'Custom shapes',
    href: '/stickers?product=die-cut#configure',
    image: dieCutCategory,
  },
  {
    title: 'Sticker Sheets',
    description: 'Multiple designs',
    href: '/stickers?product=sticker-sheets#configure',
    image: stickerSheetsCategory,
    note: 'Format illustration',
  },
  {
    title: 'Roll Labels',
    description: 'Product runs',
    href: '/stickers?product=labels-on-roll#configure',
    image: labelsRollCategory,
    note: 'Print production example',
  },
  {
    title: 'Custom Labels',
    description: 'Jars, bottles, bags',
    href: '/stickers?product=custom-labels#configure',
    image: customLabelsCategory,
  },
  {
    title: 'Material Samples',
    description: 'Ask about availability',
    href: '/contact?service=Sticker%20samples&message=I%20would%20like%20to%20compare%20your%20sticker%20materials.%20What%20samples%20are%20available%20and%20what%20do%20they%20cost%3F',
    image: samplePacksCategory,
    note: 'Holographic print example',
  },
]

export default function ProductCategories() {
  return (
    <section className="py-10 md:py-16">
      <div className="section-container">
        <div className="mb-6 md:mb-8 flex flex-col gap-2 text-center md:text-left">
          <p className="text-primary font-bold text-xs uppercase tracking-widest">Shop stickers</p>
          <h2 className="text-2xl md:text-4xl font-black">Start with the sticker format you need.</h2>
          <p className="text-muted-foreground md:text-lg">Pick a format, upload artwork, approve your proof, then we print.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.title}
            >
              <Link
                to={cat.href}
                className="group block h-full overflow-hidden rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    decoding="async"
                    width={512}
                    height={512}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content below */}
                <div className="text-center py-5 md:py-6 px-4">
                  <h3 className="font-black text-lg md:text-xl mb-1">{cat.title}</h3>
                  <p className="text-muted-foreground text-sm">{cat.description}</p>
                  {cat.note && <p className="text-xs text-muted-foreground mt-2">{cat.note}</p>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
