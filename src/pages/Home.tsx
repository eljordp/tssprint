import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ServiceCategories from '@/components/home/ServiceCategories'
import ProjectShowcase from '@/components/home/ProjectShowcase'
import ProofProcess from '@/components/home/ProofProcess'
import Reviews from '@/components/home/Reviews'
import FAQ from '@/components/home/FAQ'
import QuickContact from '@/components/home/QuickContact'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ServiceCategories />
      <ProjectShowcase />
      <ProofProcess />
      <Reviews />
      <FAQ />
      <QuickContact />
    </>
  )
}
