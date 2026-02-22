import Hero from '@/components/home/Hero'
import TrustedBy from '@/components/home/TrustedBy'
import ProductCategories from '@/components/home/ProductCategories'
import ProductShowcase from '@/components/home/ProductShowcase'
import HowItWorks from '@/components/home/HowItWorks'
import ServicesOverview from '@/components/home/ServicesOverview'
import FAQ from '@/components/home/FAQ'
import QuickContact from '@/components/home/QuickContact'
import Reviews from '@/components/home/Reviews'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ProductCategories />
      <ProductShowcase />
      <HowItWorks />
      <ServicesOverview />
      <Reviews />
      <FAQ />
      <QuickContact />
    </>
  )
}
