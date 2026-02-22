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
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}
