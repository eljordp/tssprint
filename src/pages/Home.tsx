import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ServicesOverview from '@/components/home/ServicesOverview'
import ProofProcess from '@/components/home/ProofProcess'
import QuickContact from '@/components/home/QuickContact'
import Reviews from '@/components/home/Reviews'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ServicesOverview />
      <ProofProcess />
      <QuickContact />
      <Reviews />
    </>
  )
}
