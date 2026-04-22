import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ProductCategories from '@/components/home/ProductCategories'
import ProjectGallery from '@/components/home/ProjectGallery'
import ServicesOverview from '@/components/home/ServicesOverview'
import Reviews from '@/components/home/Reviews'
import FAQ from '@/components/home/FAQ'
import SavingsAndRewards from '@/components/home/SavingsAndRewards'
import QuickContact from '@/components/home/QuickContact'

export default function Home() {
  return (
    <>
      <Hero />
      <ProductCategories />
      <TrustedBy />
      <ProjectGallery />
      <ServicesOverview />
      <Reviews />
      <SavingsAndRewards />
      <FAQ compact />
      <QuickContact />
    </>
  )
}
