import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'tss2026admin'
const AUTH_KEY = 'tss-admin-auth'
const PRICING_KEY = 'tss-admin-pricing'
const PROMOS_KEY = 'tss-admin-promos'
const SETTINGS_KEY = 'tss-admin-settings'
const GA_KEY = 'tss-admin-ga'

const QUANTITY_TIERS = [50, 100, 200, 300, 500, 1000] as const
const DIAMETERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]

const DEFAULT_BASE_PRICES: Record<number, Record<number, number>> = {
  1: { 50: 51, 100: 60, 200: 70, 300: 75, 500: 90, 1000: 125 },
  2: { 50: 60, 100: 70, 200: 90, 300: 105, 500: 135, 1000: 200 },
  3: { 50: 70, 100: 90, 200: 120, 300: 145, 500: 200, 1000: 310 },
  4: { 50: 80, 100: 110, 200: 155, 300: 199, 500: 275, 1000: 450 },
  5: { 50: 95, 100: 130, 200: 199, 300: 255, 500: 365, 1000: 605 },
  6: { 50: 110, 100: 160, 200: 245, 300: 325, 500: 470, 1000: 790 },
  7: { 50: 130, 100: 190, 200: 300, 300: 400, 500: 585, 1000: 990 },
  8: { 50: 145, 100: 225, 200: 355, 300: 480, 500: 705, 1000: 1210 },
  9: { 50: 155, 100: 236, 200: 385, 300: 525, 500: 771, 1000: 1325 },
  11: { 50: 210, 100: 337, 200: 563, 300: 765, 500: 1141, 1000: 2140 },
}

const DEFAULT_MATERIAL_MULTIPLIERS: Record<string, number> = {
  matte: 1,
  gloss: 1,
  clear: 1.15,
  holographic: 1.25,
  paper: 0.9,
  'embossed/UV': 2,
}

const DEFAULT_QUANTITY_DISCOUNTS: { minQty: number; discount: number }[] = [
  { minQty: 100, discount: 5 },
  { minQty: 200, discount: 10 },
  { minQty: 300, discount: 15 },
  { minQty: 500, discount: 22 },
  { minQty: 1000, discount: 30 },
]

interface PromoCode {
  code: string
  discountPercent: number
  minOrder: number
  active: boolean
  expiry: string
}

interface Settings {
  contactEmail: string
  businessPhone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zip: string
  turnaroundStandard: string
  turnaroundRush: string
  turnaroundBulk: string
  instagramUrl: string
}

const DEFAULT_SETTINGS: Settings = {
  contactEmail: 'thestickersmith@gmail.com',
  businessPhone: '(510) 634-8203',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  turnaroundStandard: '5-7 business days',
  turnaroundRush: '2-3 business days',
  turnaroundBulk: '7-14 business days',
  instagramUrl: '',
}

const DEFAULT_PROMOS: PromoCode[] = [
  { code: 'WELCOME15', discountPercent: 15, minOrder: 50, active: true, expiry: '' },
]

// ── Service Pricing Defaults ──
const DEFAULT_MYLAR_PRICING = {
  eighth: [
    { tier: '1-249', regular: 0.90, holo: 1.00 },
    { tier: '250-999', regular: 0.85, holo: 0.95 },
    { tier: '1000-2499', regular: 0.80, holo: 0.90 },
    { tier: '2500-4999', regular: 0.75, holo: 0.85 },
    { tier: '5000+', regular: 0.70, holo: 0.80 },
  ],
  qtr: [
    { tier: '1-249', regular: 1.00, holo: 1.25 },
    { tier: '250-999', regular: 0.97, holo: 1.15 },
    { tier: '1000-2499', regular: 0.90, holo: 1.00 },
    { tier: '2500-4999', regular: 0.87, holo: 0.95 },
    { tier: '5000+', regular: 0.72, holo: 0.90 },
  ],
  ounce: [
    { tier: '1-249', regular: 2.00, holo: 2.25 },
    { tier: '250-999', regular: 1.95, holo: 2.00 },
    { tier: '1000-2499', regular: 1.85, holo: 1.95 },
    { tier: '2500-4999', regular: 1.80, holo: 1.90 },
    { tier: '5000+', regular: 1.75, holo: 1.85 },
  ],
  half: [
    { tier: '1-49', regular: 7.50, holo: 8.00 },
    { tier: '50-99', regular: 7.00, holo: 7.50 },
    { tier: '100-249', regular: 6.50, holo: 7.00 },
    { tier: '250+', regular: 6.00, holo: 6.50 },
  ],
  pound: [
    { tier: '1-49', regular: 10.00, holo: 12.00 },
    { tier: '50-99', regular: 9.00, holo: 10.00 },
    { tier: '100-249', regular: 8.00, holo: 9.00 },
    { tier: '250+', regular: 7.50, holo: 8.50 },
  ],
  jar: [
    { tier: '1-640', regular: 2.00, holo: 2.50 },
    { tier: '641-1280', regular: 1.95, holo: 2.45 },
    { tier: '1281-1920', regular: 1.90, holo: 2.40 },
    { tier: '1921-2500', regular: 1.85, holo: 2.35 },
    { tier: '2501+', regular: 1.80, holo: 2.30 },
  ],
}

const DEFAULT_BUSINESS_CARDS_PRICING = {
  sizes: [
    { size: 'Standard (3.5" x 2")', qty250: 49, qty500: 79, qty1000: 129 },
    { size: 'Square (2.5" x 2.5")', qty250: 59, qty500: 89, qty1000: 149 },
    { size: 'Mini (3" x 1")', qty250: 39, qty500: 59, qty1000: 99 },
  ],
  finishes: [
    { name: 'Soft-Touch', price: 15 },
    { name: 'Spot UV', price: 25 },
    { name: 'Foil Stamping', price: 35 },
    { name: 'Rounded Corners', price: 10 },
  ],
}

const DEFAULT_OFFICE_PRICING = [
  { product: 'Letterhead', qty1: 99, qty2: 149, qty3: 229, labels: ['250', '500', '1000'] },
  { product: '#10 Envelopes', qty1: 129, qty2: 189, qty3: 299, labels: ['250', '500', '1000'] },
  { product: 'Notepads', qty1: 79, qty2: 159, qty3: 279, labels: ['10 pads', '25 pads', '50 pads'] },
  { product: 'Presentation Folders', qty1: 199, qty2: 349, qty3: 549, labels: ['100', '250', '500'] },
]

const DEFAULT_RETRACTABLE_BANNERS = [
  { size: 'Economy (33" x 78")', qty1: 89, qty2_5: 79, qty6: 69 },
  { size: 'Standard (33" x 81")', qty1: 129, qty2_5: 109, qty6: 95 },
  { size: 'Premium (36" x 85")', qty1: 169, qty2_5: 149, qty6: 129 },
  { size: 'Wide (47" x 85")', qty1: 229, qty2_5: 199, qty6: 179 },
]

const DEFAULT_AFRAME_SIGNS = [
  { size: 'Small (20" x 20")', qty1_2: 129, qty3_5: 120, qty6: 108 },
  { size: 'Standard (24" x 36")', qty1_2: 259, qty3_5: 240, qty6: 218 },
]

const DEFAULT_FEATHER_FLAGS = [
  { size: 'Medium (7ft)', basePrice: 200 },
  { size: 'Large (14ft)', basePrice: 279 },
]

const DEFAULT_DOOR_SPOT = [
  { size: 'Small (12" x 12")', qty1_2: 75, qty3_5: 65, qty6: 55 },
  { size: 'Medium (18" x 18")', qty1_2: 120, qty3_5: 100, qty6: 85 },
  { size: 'Large (24" x 24")', qty1_2: 175, qty3_5: 150, qty6: 125 },
  { size: 'Door Panel (36" x 18")', qty1_2: 225, qty3_5: 195, qty6: 165 },
]

const DEFAULT_PARTIAL_WRAPS = [
  { coverage: 'Quarter Wrap', qty1: 500, qty2_3: 450, qty4: 400 },
  { coverage: 'Half Wrap', qty1: 900, qty2_3: 800, qty4: 700 },
  { coverage: 'Three-Quarter Wrap', qty1: 1400, qty2_3: 1250, qty4: 1100 },
]

const DEFAULT_FULL_WRAPS = [
  { vehicle: 'Compact Car', qty1: 2500, qty2_3: 2250, qty4: 2000 },
  { vehicle: 'Sedan/SUV', qty1: 3200, qty2_3: 2900, qty4: 2600 },
  { vehicle: 'Truck/Van', qty1: 4000, qty2_3: 3600, qty4: 3200 },
  { vehicle: 'Box Truck/Trailer', qty1: 5500, qty2_3: 0, qty4: 0 },
]

const DEFAULT_FLEET_DISCOUNTS = [
  { tier: 'Starter (3-5)', discount: '15%', doors: 55, partials: 600, fulls: 2200 },
  { tier: 'Growing (6-10)', discount: '20%', doors: 50, partials: 550, fulls: 2000 },
  { tier: 'Large (11-25)', discount: '25%', doors: 45, partials: 500, fulls: 1800 },
]

const DEFAULT_WINDOW_FILM = [
  { type: 'Frosted', pricePerSqft: 8 },
  { type: 'Solar', pricePerSqft: 12 },
  { type: 'Security', pricePerSqft: 15 },
  { type: 'Decorative', pricePerSqft: 10 },
  { type: 'One-Way', pricePerSqft: 14 },
]

type ServicePricingKey = 'mylar' | 'businessCards' | 'office' | 'banners' | 'aframes' | 'featherFlags' | 'doorSpot' | 'partialWraps' | 'fullWraps' | 'fleet' | 'windowFilm'

const SERVICE_SECTIONS: { id: ServicePricingKey; label: string }[] = [
  { id: 'mylar', label: 'Mylar Packaging' },
  { id: 'businessCards', label: 'Business Cards' },
  { id: 'office', label: 'Office Printing' },
  { id: 'banners', label: 'Retractable Banners' },
  { id: 'aframes', label: 'A-Frame Signs' },
  { id: 'featherFlags', label: 'Feather Flags' },
  { id: 'doorSpot', label: 'Door/Spot Graphics' },
  { id: 'partialWraps', label: 'Partial Wraps' },
  { id: 'fullWraps', label: 'Full Wraps' },
  { id: 'fleet', label: 'Fleet Discounts' },
  { id: 'windowFilm', label: 'Window Film' },
]

function getServiceDefault(key: ServicePricingKey): any {
  const map: Record<ServicePricingKey, any> = {
    mylar: DEFAULT_MYLAR_PRICING,
    businessCards: DEFAULT_BUSINESS_CARDS_PRICING,
    office: DEFAULT_OFFICE_PRICING,
    banners: DEFAULT_RETRACTABLE_BANNERS,
    aframes: DEFAULT_AFRAME_SIGNS,
    featherFlags: DEFAULT_FEATHER_FLAGS,
    doorSpot: DEFAULT_DOOR_SPOT,
    partialWraps: DEFAULT_PARTIAL_WRAPS,
    fullWraps: DEFAULT_FULL_WRAPS,
    fleet: DEFAULT_FLEET_DISCOUNTS,
    windowFilm: DEFAULT_WINDOW_FILM,
  }
  return structuredClone(map[key])
}

function loadServicePricing(key: ServicePricingKey): any {
  return loadJSON(`tss-admin-pricing-${key}`, null) ?? getServiceDefault(key)
}

const ORDER_STATUSES = ['submitted', 'proof-sent', 'approved', 'printing', 'shipped', 'delivered'] as const
const ORDER_FILTER_STATUSES = ['All', 'Submitted', 'Printing', 'Shipped', 'Delivered'] as const

type Tab = 'orders' | 'customers' | 'analytics' | 'pricing' | 'promos' | 'settings'
type DateRange = 'today' | '7days' | '30days' | 'all'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function getDateRangeStart(range: DateRange): Date | null {
  if (range === 'all') return null
  const now = new Date()
  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return start
  }
  if (range === '7days') {
    const start = new Date(now)
    start.setDate(start.getDate() - 7)
    return start
  }
  if (range === '30days') {
    const start = new Date(now)
    start.setDate(start.getDate() - 30)
    return start
  }
  return null
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'submitted': return 'bg-yellow-500/20 text-yellow-400'
    case 'proof-sent': return 'bg-orange-500/20 text-orange-400'
    case 'approved': return 'bg-teal-500/20 text-teal-400'
    case 'printing': return 'bg-purple-500/20 text-purple-400'
    case 'shipped': return 'bg-blue-500/20 text-blue-400'
    case 'delivered': return 'bg-green-500/20 text-green-400'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('orders')

  // Pricing state
  const [basePrices, setBasePrices] = useState<Record<number, Record<number, number>>>(() => {
    const saved = loadJSON<{ basePrices?: Record<number, Record<number, number>> }>(PRICING_KEY, {})
    return saved.basePrices ?? structuredClone(DEFAULT_BASE_PRICES)
  })
  const [materialMultipliers, setMaterialMultipliers] = useState<Record<string, number>>(() => {
    const saved = loadJSON<{ materialMultipliers?: Record<string, number> }>(PRICING_KEY, {})
    return saved.materialMultipliers ?? { ...DEFAULT_MATERIAL_MULTIPLIERS }
  })
  const [quantityDiscounts, setQuantityDiscounts] = useState<{ minQty: number; discount: number }[]>(() => {
    const saved = loadJSON<{ quantityDiscounts?: { minQty: number; discount: number }[] }>(PRICING_KEY, {})
    return saved.quantityDiscounts ?? [...DEFAULT_QUANTITY_DISCOUNTS]
  })
  const [pricingSaved, setPricingSaved] = useState(false)

  // Promo state
  const [promos, setPromos] = useState<PromoCode[]>(() => loadJSON(PROMOS_KEY, DEFAULT_PROMOS))
  const [newPromo, setNewPromo] = useState<PromoCode>({ code: '', discountPercent: 0, minOrder: 0, active: true, expiry: '' })

  // Analytics state
  const [gaTrackingId, setGaTrackingId] = useState(() => localStorage.getItem(GA_KEY) ?? '')

  // Settings state
  const [settings, setSettings] = useState<Settings>(() => loadJSON(SETTINGS_KEY, DEFAULT_SETTINGS))
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Analytics data
  const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, avgOrder: 0, recentOrders: [] as any[], customers: [] as any[], pageViews: 0, contactSubmissions: [] as any[] })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsDateRange, setAnalyticsDateRange] = useState<DateRange>('all')

  // Orders tab state
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('All')
  const [ordersDateRange, setOrdersDateRange] = useState<DateRange>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [orderStatusUpdates, setOrderStatusUpdates] = useState<Record<string, string>>({})
  const [orderUpdateSuccess, setOrderUpdateSuccess] = useState<string | null>(null)

  // Customers tab state
  const [customers, setCustomers] = useState<any[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Record<string, any[]>>({})
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>({})
  const [customerNoteSaved, setCustomerNoteSaved] = useState<string | null>(null)

  // Service pricing state
  const [openPricingSection, setOpenPricingSection] = useState<string | null>('stickers')
  const [servicePricing, setServicePricing] = useState<Record<ServicePricingKey, any>>(() => {
    const out: any = {}
    for (const s of SERVICE_SECTIONS) out[s.id] = loadServicePricing(s.id)
    return out
  })
  const [serviceSaved, setServiceSaved] = useState<string | null>(null)

  // Fetch orders for Orders tab
  useEffect(() => {
    if (tab !== 'orders' || !authed) return
    setOrdersLoading(true)
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setOrdersLoading(false)
      })
  }, [tab, authed])

  // Fetch customers for Customers tab
  useEffect(() => {
    if (tab !== 'customers' || !authed) return
    setCustomersLoading(true)
    supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomers(data || [])
        setCustomersLoading(false)
      })
  }, [tab, authed])

  // Fetch analytics data
  useEffect(() => {
    if (tab !== 'analytics' || !authed) return
    setAnalyticsLoading(true)

    Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('page_views').select('id', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(10),
    ]).then(([ordersRes, customersRes, viewsRes, contactsRes]) => {
      const allOrders = ordersRes.data || []
      const rangeStart = getDateRangeStart(analyticsDateRange)
      const filteredOrders = rangeStart
        ? allOrders.filter((o: any) => new Date(o.created_at) >= rangeStart)
        : allOrders

      const totalOrders = filteredOrders.length
      const totalRevenue = filteredOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

      setAnalytics({
        totalOrders,
        totalRevenue,
        avgOrder,
        recentOrders: filteredOrders.slice(0, 20),
        customers: customersRes.data || [],
        pageViews: viewsRes.count || 0,
        contactSubmissions: contactsRes.data || [],
      })
      setAnalyticsLoading(false)
    })
  }, [tab, authed, analyticsDateRange])

  // Fetch customer orders when expanding a customer
  function fetchCustomerOrders(email: string, customerId: string) {
    if (customerOrders[customerId]) return
    supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCustomerOrders(prev => ({ ...prev, [customerId]: data || [] }))
      })
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      setError('')
    } else {
      setError('Incorrect password.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
    setPassword('')
  }

  function savePricing() {
    localStorage.setItem(PRICING_KEY, JSON.stringify({ basePrices, materialMultipliers, quantityDiscounts }))
    setPricingSaved(true)
    setTimeout(() => setPricingSaved(false), 2000)
  }

  function resetPricing() {
    setBasePrices(structuredClone(DEFAULT_BASE_PRICES))
    setMaterialMultipliers({ ...DEFAULT_MATERIAL_MULTIPLIERS })
    setQuantityDiscounts([...DEFAULT_QUANTITY_DISCOUNTS])
    localStorage.removeItem(PRICING_KEY)
  }

  function updateBasePrice(diameter: number, qty: number, value: string) {
    const num = parseFloat(value)
    if (isNaN(num)) return
    setBasePrices(prev => ({
      ...prev,
      [diameter]: { ...prev[diameter], [qty]: num },
    }))
  }

  function savePromos(updated: PromoCode[]) {
    setPromos(updated)
    localStorage.setItem(PROMOS_KEY, JSON.stringify(updated))
  }

  function addPromo() {
    if (!newPromo.code.trim()) return
    const updated = [...promos, { ...newPromo, code: newPromo.code.toUpperCase().trim() }]
    savePromos(updated)
    setNewPromo({ code: '', discountPercent: 0, minOrder: 0, active: true, expiry: '' })
  }

  function deletePromo(index: number) {
    savePromos(promos.filter((_, i) => i !== index))
  }

  function togglePromo(index: number) {
    const updated = promos.map((p, i) => (i === index ? { ...p, active: !p.active } : p))
    savePromos(updated)
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2000)
  }

  function saveGA() {
    localStorage.setItem(GA_KEY, gaTrackingId)
  }

  function saveServicePricing(key: ServicePricingKey) {
    localStorage.setItem(`tss-admin-pricing-${key}`, JSON.stringify(servicePricing[key]))
    setServiceSaved(key)
    setTimeout(() => setServiceSaved(null), 2000)
  }

  function resetServicePricing(key: ServicePricingKey) {
    setServicePricing(prev => ({ ...prev, [key]: getServiceDefault(key) }))
    localStorage.removeItem(`tss-admin-pricing-${key}`)
  }

  function updateServiceField(key: ServicePricingKey, path: (string | number)[], value: any) {
    setServicePricing(prev => {
      const updated = structuredClone(prev)
      let target: any = updated[key]
      for (let i = 0; i < path.length - 1; i++) target = target[path[i]]
      target[path[path.length - 1]] = value
      return updated
    })
  }

  const togglePricingSection = (id: string) => setOpenPricingSection(openPricingSection === id ? null : id)

  async function updateOrderStatus(orderId: string) {
    const newStatus = orderStatusUpdates[orderId]
    if (!newStatus) return
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      setOrderUpdateSuccess(orderId)
      setTimeout(() => setOrderUpdateSuccess(null), 2000)
    }
  }

  async function saveCustomerNotes(customerId: string) {
    const notes = customerNotes[customerId] ?? ''
    const { error } = await supabase.from('customers').update({ notes }).eq('id', customerId)
    if (!error) {
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, notes } : c))
      setCustomerNoteSaved(customerId)
      setTimeout(() => setCustomerNoteSaved(null), 2000)
    }
  }

  // Filtered orders for Orders tab
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (ordersStatusFilter !== 'All' && order.status !== ordersStatusFilter.toLowerCase()) return false
    // Date range filter
    const rangeStart = getDateRangeStart(ordersDateRange)
    if (rangeStart && new Date(order.created_at) < rangeStart) return false
    return true
  })

  // Filtered customers for Customers tab
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true
    const q = customerSearch.toLowerCase()
    const name = `${c.first_name || ''} ${c.last_name || ''} ${c.name || ''}`.toLowerCase()
    const email = (c.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  // Revenue by day for analytics (last 7 days)
  function getRevenueByDay(): { date: string; revenue: number }[] {
    const days: { date: string; revenue: number }[] = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayRevenue = (analytics.recentOrders || [])
        .concat(orders) // use all available orders
        .filter((o: any, idx: number, arr: any[]) => {
          // dedupe by id
          return arr.findIndex((x: any) => x.id === o.id) === idx
        })
        .filter((o: any) => o.created_at && o.created_at.startsWith(dateStr))
        .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)
      days.push({ date: formatDate(dateStr + 'T00:00:00'), revenue: dayRevenue })
    }
    return days
  }

  const inputClass = 'w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary'
  const smallInputClass = 'bg-secondary border border-border rounded px-2 py-1 text-foreground text-sm text-center w-20 focus:outline-none focus:border-primary'
  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`
  const dateRangeBtnClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
      active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
    }`

  // --- Password Gate ---
  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-foreground mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full text-sm">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- Dashboard ---
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-1.5">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button className={tabClass('orders')} onClick={() => setTab('orders')}>Orders</button>
          <button className={tabClass('customers')} onClick={() => setTab('customers')}>Customers</button>
          <button className={tabClass('analytics')} onClick={() => setTab('analytics')}>Analytics</button>
          <button className={tabClass('pricing')} onClick={() => setTab('pricing')}>Pricing</button>
          <button className={tabClass('promos')} onClick={() => setTab('promos')}>Promo Codes</button>
          <button className={tabClass('settings')} onClick={() => setTab('settings')}>Settings</button>
        </div>

        {/* Tab: Orders */}
        {tab === 'orders' && (
          <div className="space-y-6 pb-12">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Status:</label>
                <select
                  value={ordersStatusFilter}
                  onChange={e => setOrdersStatusFilter(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  {ORDER_FILTER_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Date:</label>
                <button className={dateRangeBtnClass(ordersDateRange === 'today')} onClick={() => setOrdersDateRange('today')}>Today</button>
                <button className={dateRangeBtnClass(ordersDateRange === '7days')} onClick={() => setOrdersDateRange('7days')}>7 days</button>
                <button className={dateRangeBtnClass(ordersDateRange === '30days')} onClick={() => setOrdersDateRange('30days')}>30 days</button>
                <button className={dateRangeBtnClass(ordersDateRange === 'all')} onClick={() => setOrdersDateRange('all')}>All</button>
              </div>
            </div>

            {ordersLoading && <p className="text-sm text-muted-foreground">Loading orders...</p>}

            {!ordersLoading && filteredOrders.length === 0 && (
              <p className="text-sm text-muted-foreground">No orders found.</p>
            )}

            {/* Order List */}
            <div className="space-y-3">
              {filteredOrders.map((order: any) => {
                const isExpanded = expandedOrderId === order.id
                const items: any[] = Array.isArray(order.items) ? order.items : []
                const firstItemName = items.length > 0 ? (items[0].name || items[0].product_name || 'Item') : 'No items'
                const moreCount = items.length > 1 ? items.length - 1 : 0

                return (
                  <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Order Row */}
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground font-mono shrink-0">#{String(order.id).slice(-8)}</span>
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{order.customer_first_name} {order.customer_last_name}</span>
                          <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">{order.customer_email}</span>
                        </div>
                        <span className="text-xs text-muted-foreground hidden md:inline truncate">
                          {firstItemName}{moreCount > 0 ? ` and ${moreCount} more` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-bold">${Number(order.total).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(order.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4 space-y-4 bg-secondary/30">
                        {/* Customer Details */}
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Customer Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Name:</span> {order.customer_first_name} {order.customer_last_name}</div>
                            <div><span className="text-muted-foreground">Email:</span> {order.customer_email}</div>
                            {order.customer_phone && <div><span className="text-muted-foreground">Phone:</span> {order.customer_phone}</div>}
                            {(order.shipping_address || order.address) && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {order.shipping_address || order.address}</div>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        {items.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items</h3>
                            <div className="space-y-2">
                              {items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-sm">
                                  <div>
                                    <span className="font-medium">{item.name || item.product_name || 'Item'}</span>
                                    {item.size && <span className="text-muted-foreground ml-2">Size: {item.size}</span>}
                                    {item.option && <span className="text-muted-foreground ml-2">Option: {item.option}</span>}
                                    {item.material && <span className="text-muted-foreground ml-2">Material: {item.material}</span>}
                                  </div>
                                  <div className="flex items-center gap-3 text-sm">
                                    {item.quantity && <span className="text-muted-foreground">x{item.quantity}</span>}
                                    {item.price && <span className="font-medium">${Number(item.price).toFixed(2)}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Status Update */}
                        <div className="flex items-center gap-3">
                          <label className="text-xs text-muted-foreground">Update Status:</label>
                          <select
                            value={orderStatusUpdates[order.id] ?? order.status}
                            onChange={e => setOrderStatusUpdates(prev => ({ ...prev, [order.id]: e.target.value }))}
                            className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground text-sm focus:outline-none focus:border-primary"
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => updateOrderStatus(order.id)}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            Update Status
                          </button>
                          {orderUpdateSuccess === order.id && (
                            <span className="text-xs text-primary">Status updated!</span>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Order placed: {formatDateTime(order.created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Customers */}
        {tab === 'customers' && (
          <div className="space-y-6 pb-12">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className={inputClass + ' max-w-md'}
              />
            </div>

            {customersLoading && <p className="text-sm text-muted-foreground">Loading customers...</p>}

            {!customersLoading && filteredCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">No customers found.</p>
            )}

            {/* Customer List */}
            <div className="space-y-3">
              {filteredCustomers.map((customer: any) => {
                const isExpanded = expandedCustomerId === customer.id
                const customerName = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'

                return (
                  <div key={customer.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Customer Row */}
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                      onClick={() => {
                        const newId = isExpanded ? null : customer.id
                        setExpandedCustomerId(newId)
                        if (newId && customer.email) {
                          fetchCustomerOrders(customer.email, customer.id)
                        }
                        if (newId && !(customer.id in customerNotes)) {
                          setCustomerNotes(prev => ({ ...prev, [customer.id]: customer.notes || '' }))
                        }
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{customerName}</span>
                          <span className="text-sm text-muted-foreground ml-2">{customer.email}</span>
                        </div>
                        {customer.phone && (
                          <span className="text-xs text-muted-foreground hidden md:inline">{customer.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {customer.total_spent != null && (
                          <span className="text-sm font-bold">${Number(customer.total_spent).toFixed(2)}</span>
                        )}
                        {customer.order_count != null && (
                          <span className="text-xs text-muted-foreground">{customer.order_count} orders</span>
                        )}
                        {customer.referral_code && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{customer.referral_code}</span>
                        )}
                        {customer.source && (
                          <span className="text-xs text-muted-foreground hidden sm:inline">{customer.source}</span>
                        )}
                        <span className="text-xs text-muted-foreground hidden sm:inline">{formatDate(customer.created_at)}</span>
                        <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4 space-y-4 bg-secondary/30">
                        {/* Full Customer Details */}
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Customer Details</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Name:</span> {customerName}</div>
                            <div><span className="text-muted-foreground">Email:</span> {customer.email}</div>
                            {customer.phone && <div><span className="text-muted-foreground">Phone:</span> {customer.phone}</div>}
                            {customer.total_spent != null && <div><span className="text-muted-foreground">Total Spent:</span> ${Number(customer.total_spent).toFixed(2)}</div>}
                            {customer.order_count != null && <div><span className="text-muted-foreground">Order Count:</span> {customer.order_count}</div>}
                            {customer.referral_code && <div><span className="text-muted-foreground">Referral Code:</span> {customer.referral_code}</div>}
                            {customer.source && <div><span className="text-muted-foreground">Source:</span> {customer.source}</div>}
                            <div><span className="text-muted-foreground">Joined:</span> {formatDate(customer.created_at)}</div>
                          </div>
                        </div>

                        {/* Customer Orders */}
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Orders</h3>
                          {!customerOrders[customer.id] ? (
                            <p className="text-xs text-muted-foreground">Loading orders...</p>
                          ) : customerOrders[customer.id].length === 0 ? (
                            <p className="text-xs text-muted-foreground">No orders found for this customer.</p>
                          ) : (
                            <div className="space-y-2">
                              {customerOrders[customer.id].map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-sm">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground font-mono">#{String(order.id).slice(-8)}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(order.status)}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">${Number(order.total).toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Notes</h3>
                          <textarea
                            value={customerNotes[customer.id] ?? customer.notes ?? ''}
                            onChange={e => setCustomerNotes(prev => ({ ...prev, [customer.id]: e.target.value }))}
                            placeholder="Add notes about this customer..."
                            className={inputClass + ' h-20 resize-none'}
                          />
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => saveCustomerNotes(customer.id)}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Save Notes
                            </button>
                            {customerNoteSaved === customer.id && (
                              <span className="text-xs text-primary">Notes saved!</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Analytics */}
        {tab === 'analytics' && (
          <div className="space-y-6 pb-12">
            {/* Date Range Buttons */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Date Range:</label>
              <button className={dateRangeBtnClass(analyticsDateRange === 'today')} onClick={() => setAnalyticsDateRange('today')}>Today</button>
              <button className={dateRangeBtnClass(analyticsDateRange === '7days')} onClick={() => setAnalyticsDateRange('7days')}>7 days</button>
              <button className={dateRangeBtnClass(analyticsDateRange === '30days')} onClick={() => setAnalyticsDateRange('30days')}>30 days</button>
              <button className={dateRangeBtnClass(analyticsDateRange === 'all')} onClick={() => setAnalyticsDateRange('all')}>All time</button>
            </div>

            {analyticsLoading && (
              <p className="text-sm text-muted-foreground">Loading analytics...</p>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Avg Order Value</p>
                <p className="text-2xl font-bold">${analytics.avgOrder.toFixed(2)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Page Views</p>
                <p className="text-2xl font-bold">{analytics.pageViews}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Contacts</p>
                <p className="text-2xl font-bold">{analytics.contactSubmissions.length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">Customers</p>
                <p className="text-2xl font-bold">{analytics.customers.length}</p>
              </div>
            </div>

            {/* Revenue by Day */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue by Day (Last 7 Days)</h2>
              <div className="space-y-2">
                {getRevenueByDay().map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-2 text-sm">
                    <span className="text-muted-foreground">{day.date}</span>
                    <span className="font-semibold">${day.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {analytics.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {analytics.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3 text-sm">
                      <div>
                        <span className="font-medium">{order.customer_first_name} {order.customer_last_name}</span>
                        <span className="text-muted-foreground ml-2">{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(order.status)}`}>{order.status}</span>
                        <span className="font-semibold">${Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Contact Submissions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Contact Submissions</h2>
              {analytics.contactSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contact submissions yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {analytics.contactSubmissions.map((contact: any) => (
                    <div key={contact.id} className="bg-secondary rounded-lg px-4 py-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-muted-foreground ml-2">{contact.email}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</span>
                      </div>
                      {contact.service && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mr-2">{contact.service}</span>
                      )}
                      {contact.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{contact.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GA Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Google Analytics</h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="GA Tracking ID (e.g. G-XXXXXXXXXX)"
                  value={gaTrackingId}
                  onChange={e => setGaTrackingId(e.target.value)}
                  className={inputClass + ' max-w-sm'}
                />
                <button onClick={saveGA} className="btn-primary text-sm whitespace-nowrap">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pricing */}
        {tab === 'pricing' && (
          <div className="space-y-4 pb-12">
            <p className="text-xs text-muted-foreground">
              Pricing changes are saved locally. Contact developer to update live prices.
            </p>

            {/* ── Stickers (collapsible) ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('stickers')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Stickers</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'stickers' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'stickers' && (
                <div className="border-t border-border p-5 space-y-6">
                  {/* Base Prices */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Base Circle Prices ($)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-2 pr-4">Diameter</th>
                            {QUANTITY_TIERS.map(q => <th key={q} className="text-center py-2 px-2">{q}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {DIAMETERS.map(d => (
                            <tr key={d} className="border-t border-border">
                              <td className="py-2 pr-4 font-medium">{d}"</td>
                              {QUANTITY_TIERS.map(q => (
                                <td key={q} className="py-2 px-1">
                                  <input type="number" step="0.01" value={basePrices[d]?.[q] ?? ''} onChange={e => updateBasePrice(d, q, e.target.value)} className={smallInputClass} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Material Multipliers */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Material Multipliers</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(materialMultipliers).map(([mat, mult]) => (
                        <div key={mat} className="flex items-center gap-2">
                          <label className="text-sm text-muted-foreground w-24 capitalize">{mat}</label>
                          <input type="number" step="0.01" value={mult} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setMaterialMultipliers(prev => ({ ...prev, [mat]: v })) }} className={smallInputClass} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Quantity Discounts */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Quantity Discount Tiers</h3>
                    <div className="space-y-2">
                      {quantityDiscounts.map((tier, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <label className="text-xs text-muted-foreground">Min Qty</label>
                          <input type="number" value={tier.minQty} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) { const u = [...quantityDiscounts]; u[i] = { ...u[i], minQty: v }; setQuantityDiscounts(u) } }} className={smallInputClass} />
                          <label className="text-xs text-muted-foreground">Discount</label>
                          <input type="number" value={tier.discount} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) { const u = [...quantityDiscounts]; u[i] = { ...u[i], discount: v }; setQuantityDiscounts(u) } }} className={smallInputClass} />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={savePricing} className="btn-primary text-xs px-3 py-1.5">Save Sticker Pricing</button>
                    <button onClick={resetPricing} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {pricingSaved && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Mylar Packaging ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('mylar')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Mylar Packaging</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'mylar' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'mylar' && (
                <div className="border-t border-border p-5 space-y-4">
                  {Object.entries(servicePricing.mylar as typeof DEFAULT_MYLAR_PRICING).map(([sizeKey, tiers]) => (
                    <div key={sizeKey}>
                      <h3 className="text-sm font-semibold mb-2 capitalize">{sizeKey === 'qtr' ? 'QTRs' : sizeKey === 'jar' ? '2oz Jars' : sizeKey}</h3>
                      <div className="overflow-x-auto">
                        <table className="text-xs w-full">
                          <thead><tr className="text-muted-foreground"><th className="text-left py-1">Tier</th><th className="text-center py-1">Regular</th><th className="text-center py-1">Holo</th></tr></thead>
                          <tbody>
                            {(tiers as any[]).map((t: any, i: number) => (
                              <tr key={i} className="border-t border-border">
                                <td className="py-1 pr-2">{t.tier}</td>
                                <td className="py-1 px-1"><input type="number" step="0.01" value={t.regular} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('mylar', [sizeKey, i, 'regular'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                                <td className="py-1 px-1"><input type="number" step="0.01" value={t.holo} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('mylar', [sizeKey, i, 'holo'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('mylar')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('mylar')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'mylar' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Business Cards ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('businessCards')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Business Cards</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'businessCards' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'businessCards' && (
                <div className="border-t border-border p-5 space-y-4">
                  <h3 className="text-sm font-semibold">Size Pricing</h3>
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Size</th><th className="text-center py-1">250</th><th className="text-center py-1">500</th><th className="text-center py-1">1000</th></tr></thead>
                    <tbody>
                      {(servicePricing.businessCards.sizes as any[]).map((s: any, i: number) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{s.size}</td>
                          <td className="py-1 px-1"><input type="number" value={s.qty250} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('businessCards', ['sizes', i, 'qty250'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={s.qty500} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('businessCards', ['sizes', i, 'qty500'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={s.qty1000} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('businessCards', ['sizes', i, 'qty1000'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3 className="text-sm font-semibold pt-2">Finish Add-ons ($)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(servicePricing.businessCards.finishes as any[]).map((f: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground w-28">{f.name}</label>
                        <input type="number" value={f.price} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('businessCards', ['finishes', i, 'price'], v) }} className={smallInputClass + ' !w-16 text-xs'} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('businessCards')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('businessCards')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'businessCards' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Office Printing ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('office')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Office Printing</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'office' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'office' && (
                <div className="border-t border-border p-5 space-y-4">
                  {(servicePricing.office as typeof DEFAULT_OFFICE_PRICING).map((item, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-semibold mb-1">{item.product}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {(['qty1', 'qty2', 'qty3'] as const).map((qk, qi) => (
                          <div key={qk} className="flex items-center gap-1">
                            <label className="text-xs text-muted-foreground">{item.labels[qi]}</label>
                            <input type="number" value={(item as any)[qk]} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('office', [i, qk], v) }} className={smallInputClass + ' !w-16 text-xs'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('office')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('office')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'office' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Retractable Banners ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('banners')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Retractable Banners</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'banners' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'banners' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Size</th><th className="text-center py-1">1</th><th className="text-center py-1">2-5</th><th className="text-center py-1">6+</th></tr></thead>
                    <tbody>
                      {(servicePricing.banners as typeof DEFAULT_RETRACTABLE_BANNERS).map((b, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{b.size}</td>
                          <td className="py-1 px-1"><input type="number" value={b.qty1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('banners', [i, 'qty1'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={b.qty2_5} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('banners', [i, 'qty2_5'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={b.qty6} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('banners', [i, 'qty6'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('banners')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('banners')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'banners' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── A-Frame Signs ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('aframes')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">A-Frame Signs</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'aframes' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'aframes' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Size</th><th className="text-center py-1">1-2</th><th className="text-center py-1">3-5</th><th className="text-center py-1">6+</th></tr></thead>
                    <tbody>
                      {(servicePricing.aframes as typeof DEFAULT_AFRAME_SIGNS).map((a, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{a.size}</td>
                          <td className="py-1 px-1"><input type="number" value={a.qty1_2} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('aframes', [i, 'qty1_2'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={a.qty3_5} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('aframes', [i, 'qty3_5'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={a.qty6} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('aframes', [i, 'qty6'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('aframes')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('aframes')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'aframes' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Feather Flags ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('featherFlags')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Feather Flags</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'featherFlags' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'featherFlags' && (
                <div className="border-t border-border p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {(servicePricing.featherFlags as typeof DEFAULT_FEATHER_FLAGS).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-28">{f.size}</label>
                        <span className="text-xs text-muted-foreground">$</span>
                        <input type="number" value={f.basePrice} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('featherFlags', [i, 'basePrice'], v) }} className={smallInputClass + ' !w-20 text-xs'} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Bulk: 2-5 = 10% off, 6-9 = 15% off, 10+ = 20% off</p>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('featherFlags')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('featherFlags')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'featherFlags' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Door/Spot Graphics ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('doorSpot')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Door/Spot Graphics</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'doorSpot' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'doorSpot' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Size</th><th className="text-center py-1">1-2</th><th className="text-center py-1">3-5</th><th className="text-center py-1">6+</th></tr></thead>
                    <tbody>
                      {(servicePricing.doorSpot as typeof DEFAULT_DOOR_SPOT).map((d, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{d.size}</td>
                          <td className="py-1 px-1"><input type="number" value={d.qty1_2} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('doorSpot', [i, 'qty1_2'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={d.qty3_5} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('doorSpot', [i, 'qty3_5'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={d.qty6} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('doorSpot', [i, 'qty6'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('doorSpot')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('doorSpot')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'doorSpot' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Partial Wraps ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('partialWraps')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Partial Wraps</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'partialWraps' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'partialWraps' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Coverage</th><th className="text-center py-1">1</th><th className="text-center py-1">2-3</th><th className="text-center py-1">4+</th></tr></thead>
                    <tbody>
                      {(servicePricing.partialWraps as typeof DEFAULT_PARTIAL_WRAPS).map((p, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{p.coverage}</td>
                          <td className="py-1 px-1"><input type="number" value={p.qty1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('partialWraps', [i, 'qty1'], v) }} className={smallInputClass + ' !w-20 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={p.qty2_3} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('partialWraps', [i, 'qty2_3'], v) }} className={smallInputClass + ' !w-20 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={p.qty4} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('partialWraps', [i, 'qty4'], v) }} className={smallInputClass + ' !w-20 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('partialWraps')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('partialWraps')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'partialWraps' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Full Wraps ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('fullWraps')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Full Wraps</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'fullWraps' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'fullWraps' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Vehicle</th><th className="text-center py-1">1</th><th className="text-center py-1">2-3</th><th className="text-center py-1">4+</th></tr></thead>
                    <tbody>
                      {(servicePricing.fullWraps as typeof DEFAULT_FULL_WRAPS).map((fw, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{fw.vehicle}</td>
                          <td className="py-1 px-1"><input type="number" value={fw.qty1} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fullWraps', [i, 'qty1'], v) }} className={smallInputClass + ' !w-20 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={fw.qty2_3 || ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fullWraps', [i, 'qty2_3'], v) }} className={smallInputClass + ' !w-20 text-xs'} placeholder={fw.qty2_3 === 0 ? 'Quote' : ''} /></td>
                          <td className="py-1 px-1"><input type="number" value={fw.qty4 || ''} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fullWraps', [i, 'qty4'], v) }} className={smallInputClass + ' !w-20 text-xs'} placeholder={fw.qty4 === 0 ? 'Quote' : ''} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('fullWraps')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('fullWraps')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'fullWraps' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Fleet Discounts ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('fleet')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Fleet Discounts</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'fleet' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'fleet' && (
                <div className="border-t border-border p-5 space-y-3">
                  <table className="text-xs w-full">
                    <thead><tr className="text-muted-foreground"><th className="text-left py-1">Tier</th><th className="text-center py-1">Discount</th><th className="text-center py-1">Doors (from $)</th><th className="text-center py-1">Partials (from $)</th><th className="text-center py-1">Fulls (from $)</th></tr></thead>
                    <tbody>
                      {(servicePricing.fleet as typeof DEFAULT_FLEET_DISCOUNTS).map((f, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-1 pr-2 text-sm">{f.tier}</td>
                          <td className="py-1 px-1 text-center text-sm">{f.discount}</td>
                          <td className="py-1 px-1"><input type="number" value={f.doors} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fleet', [i, 'doors'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={f.partials} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fleet', [i, 'partials'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                          <td className="py-1 px-1"><input type="number" value={f.fulls} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('fleet', [i, 'fulls'], v) }} className={smallInputClass + ' !w-16 text-xs'} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('fleet')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('fleet')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'fleet' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

            {/* ── Window Film ── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button onClick={() => togglePricingSection('windowFilm')} className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <h2 className="text-base font-semibold">Window Film</h2>
                <span className="text-muted-foreground text-xs">{openPricingSection === 'windowFilm' ? '▲' : '▼'}</span>
              </button>
              {openPricingSection === 'windowFilm' && (
                <div className="border-t border-border p-5 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(servicePricing.windowFilm as typeof DEFAULT_WINDOW_FILM).map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground w-24">{f.type}</label>
                        <span className="text-xs text-muted-foreground">$/sqft</span>
                        <input type="number" value={f.pricePerSqft} onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) updateServiceField('windowFilm', [i, 'pricePerSqft'], v) }} className={smallInputClass + ' !w-16 text-xs'} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button onClick={() => saveServicePricing('windowFilm')} className="btn-primary text-xs px-3 py-1.5">Save</button>
                    <button onClick={() => resetServicePricing('windowFilm')} className="btn-secondary text-xs px-3 py-1.5">Reset</button>
                    {serviceSaved === 'windowFilm' && <span className="text-xs text-primary">Saved.</span>}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab: Promo Codes */}
        {tab === 'promos' && (
          <div className="space-y-6 pb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Promo Codes</h2>
              {promos.length === 0 && <p className="text-sm text-muted-foreground">No promo codes yet.</p>}
              <div className="space-y-3">
                {promos.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 bg-secondary rounded-lg px-4 py-3 text-sm">
                    <span className="font-mono font-semibold w-32">{p.code}</span>
                    <span className="text-muted-foreground">{p.discountPercent}% off</span>
                    <span className="text-muted-foreground">Min ${p.minOrder}</span>
                    <span className="text-muted-foreground">{p.expiry || 'No expiry'}</span>
                    <button
                      onClick={() => togglePromo(i)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.active ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </button>
                    <button onClick={() => deletePromo(i)} className="ml-auto text-destructive text-xs hover:underline">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Promo */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Add Promo Code</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Code</label>
                  <input
                    type="text"
                    placeholder="CODE"
                    value={newPromo.code}
                    onChange={e => setNewPromo(p => ({ ...p, code: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Discount %</label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newPromo.discountPercent || ''}
                    onChange={e => setNewPromo(p => ({ ...p, discountPercent: parseFloat(e.target.value) || 0 }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Order ($)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newPromo.minOrder || ''}
                    onChange={e => setNewPromo(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Expiry Date</label>
                  <input
                    type="date"
                    value={newPromo.expiry}
                    onChange={e => setNewPromo(p => ({ ...p, expiry: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <button onClick={addPromo} className="btn-primary text-sm">
                Add Promo Code
              </button>
            </div>
          </div>
        )}

        {/* Tab: Settings */}
        {tab === 'settings' && (
          <div className="space-y-6 pb-12">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold">Business Info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={e => setSettings(s => ({ ...s, contactEmail: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Business Phone</label>
                  <input
                    type="tel"
                    value={settings.businessPhone}
                    onChange={e => setSettings(s => ({ ...s, businessPhone: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Address Line 1</label>
                  <input
                    type="text"
                    value={settings.addressLine1}
                    onChange={e => setSettings(s => ({ ...s, addressLine1: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Address Line 2</label>
                  <input
                    type="text"
                    value={settings.addressLine2}
                    onChange={e => setSettings(s => ({ ...s, addressLine2: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">City</label>
                  <input
                    type="text"
                    value={settings.city}
                    onChange={e => setSettings(s => ({ ...s, city: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">State</label>
                    <input
                      type="text"
                      value={settings.state}
                      onChange={e => setSettings(s => ({ ...s, state: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">ZIP</label>
                    <input
                      type="text"
                      value={settings.zip}
                      onChange={e => setSettings(s => ({ ...s, zip: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold">Turnaround Times</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Standard</label>
                  <input
                    type="text"
                    value={settings.turnaroundStandard}
                    onChange={e => setSettings(s => ({ ...s, turnaroundStandard: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Rush</label>
                  <input
                    type="text"
                    value={settings.turnaroundRush}
                    onChange={e => setSettings(s => ({ ...s, turnaroundRush: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bulk</label>
                  <input
                    type="text"
                    value={settings.turnaroundBulk}
                    onChange={e => setSettings(s => ({ ...s, turnaroundBulk: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold">Social Media</h2>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/thestickersmith"
                  value={settings.instagramUrl}
                  onChange={e => setSettings(s => ({ ...s, instagramUrl: e.target.value }))}
                  className={inputClass + ' max-w-md'}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={saveSettings} className="btn-primary text-sm">
                Save Settings
              </button>
              {settingsSaved && <span className="text-sm text-primary">Saved.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
