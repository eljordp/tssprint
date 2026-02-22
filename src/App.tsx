import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Services from '@/pages/Services'
import VehicleGraphics from '@/pages/VehicleGraphics'
import Signage from '@/pages/Signage'
import Canopies from '@/pages/Canopies'
import MylarPackaging from '@/pages/MylarPackaging'
import WindowFilm from '@/pages/WindowFilm'
import BusinessPrint from '@/pages/BusinessPrint'
import Order from '@/pages/Order'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Projects from '@/pages/Projects'
import Contact from '@/pages/Contact'
import About from '@/pages/About'
import NotFound from '@/pages/NotFound'

// Service sub-pages
import CanopiesCalc from '@/pages/services/Canopies'
import TableCovers from '@/pages/services/TableCovers'
import FeatherFlags from '@/pages/services/FeatherFlags'
import Backdrops from '@/pages/services/Backdrops'
import RetractableBanners from '@/pages/services/RetractableBanners'
import AFrameSigns from '@/pages/services/AFrameSigns'
import BusinessCards from '@/pages/services/BusinessCards'
import MarketingCollateral from '@/pages/services/MarketingCollateral'
import OfficePrinting from '@/pages/services/OfficePrinting'
import PromotionalMaterials from '@/pages/services/PromotionalMaterials'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/vehicle-graphics" element={<VehicleGraphics />} />
            <Route path="/signage" element={<Signage />} />
            <Route path="/canopies" element={<Canopies />} />
            <Route path="/mylar-packaging" element={<MylarPackaging />} />
            <Route path="/window-film" element={<WindowFilm />} />
            <Route path="/business-print" element={<BusinessPrint />} />
            <Route path="/order" element={<Order />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />

            {/* Event branding sub-pages */}
            <Route path="/event-canopies/canopies" element={<CanopiesCalc />} />
            <Route path="/event-canopies/table-covers" element={<TableCovers />} />
            <Route path="/event-canopies/feather-flags" element={<FeatherFlags />} />
            <Route path="/event-canopies/backdrops" element={<Backdrops />} />

            {/* Business signage sub-pages */}
            <Route path="/business-signage/retractable-banners" element={<RetractableBanners />} />
            <Route path="/business-signage/a-frames" element={<AFrameSigns />} />

            {/* Business print sub-pages */}
            <Route path="/business-print/business-cards" element={<BusinessCards />} />
            <Route path="/business-print/marketing-collateral" element={<MarketingCollateral />} />
            <Route path="/business-print/office-printing" element={<OfficePrinting />} />
            <Route path="/business-print/promotional-materials" element={<PromotionalMaterials />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
