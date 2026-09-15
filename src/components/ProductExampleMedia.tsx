import ResponsiveImage from './ResponsiveImage'
import type { Example } from '@/lib/productExamples'

export default function ProductExampleMedia({ example, priority = false, thumbnail = false }: { example: Example; priority?: boolean; thumbnail?: boolean }) {
  return <div className="relative aspect-[4/3] w-full overflow-hidden">
    {example.image ? <ResponsiveImage fetchPriority={priority ? 'high' : undefined} loading={thumbnail ? 'eager' : 'lazy'} sizes={thumbnail ? '(min-width: 1024px) 270px, 50vw' : '(min-width: 768px) 550px, 100vw'} src={example.image} alt={example.caption} width={800} height={600} className={`h-full w-full ${example.contain ? 'object-contain bg-white' : 'object-cover'}`} style={{ objectPosition: example.position }} /> : <div role="img" aria-label={example.caption} className="h-full flex items-center justify-center bg-primary/5 p-5"><div className="border-2 border-primary/50 rounded-lg bg-background w-full aspect-[3/2] flex flex-col items-center justify-center gap-2"><span className="text-primary font-bold text-xs md:text-sm">{example.format}</span><span className="w-1/2 border-t border-primary/40" /><span className="w-1/3 border-t border-primary/40" /></div></div>}
    {(/mockup|artwork|illustration/.test(example.caption)) && <span className="absolute bottom-1 right-1 rounded bg-black/85 text-white px-2 py-1 text-[10px]">{/mockup/.test(example.caption) ? 'Design mockup' : example.image ? 'Artwork' : 'Illustration'}</span>}
  </div>
}
