import { useState, useMemo } from 'react'

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

type Tab = 'pricing' | 'promos' | 'analytics' | 'settings'

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'true')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('pricing')

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
  const analytics = useMemo(() => {
    try {
      const profiles = loadJSON<any[]>('tss-profiles', [])
      const orders = Array.isArray(profiles) ? profiles : []
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o?.total) || 0), 0)
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0
      return { totalOrders, totalRevenue, avgOrder, orders }
    } catch {
      return { totalOrders: 0, totalRevenue: 0, avgOrder: 0, orders: [] as any[] }
    }
  }, [tab])

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

  const inputClass = 'w-full bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary'
  const smallInputClass = 'bg-secondary border border-border rounded px-2 py-1 text-foreground text-sm text-center w-20 focus:outline-none focus:border-primary'
  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
        <div className="flex gap-2 mb-6">
          <button className={tabClass('pricing')} onClick={() => setTab('pricing')}>Pricing</button>
          <button className={tabClass('promos')} onClick={() => setTab('promos')}>Promo Codes</button>
          <button className={tabClass('analytics')} onClick={() => setTab('analytics')}>Analytics</button>
          <button className={tabClass('settings')} onClick={() => setTab('settings')}>Settings</button>
        </div>

        {/* Tab: Pricing */}
        {tab === 'pricing' && (
          <div className="space-y-8 pb-12">
            {/* Base Prices Table */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Base Circle Prices ($)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2 pr-4">Diameter</th>
                      {QUANTITY_TIERS.map(q => (
                        <th key={q} className="text-center py-2 px-2">{q}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DIAMETERS.map(d => (
                      <tr key={d} className="border-t border-border">
                        <td className="py-2 pr-4 font-medium">{d}"</td>
                        {QUANTITY_TIERS.map(q => (
                          <td key={q} className="py-2 px-1">
                            <input
                              type="number"
                              step="0.01"
                              value={basePrices[d]?.[q] ?? ''}
                              onChange={e => updateBasePrice(d, q, e.target.value)}
                              className={smallInputClass}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Material Multipliers */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Material Multipliers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(materialMultipliers).map(([mat, mult]) => (
                  <div key={mat} className="flex items-center gap-3">
                    <label className="text-sm text-muted-foreground w-28 capitalize">{mat}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mult}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        if (!isNaN(v)) setMaterialMultipliers(prev => ({ ...prev, [mat]: v }))
                      }}
                      className={smallInputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Discounts */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quantity Discount Tiers</h2>
              <div className="space-y-3">
                {quantityDiscounts.map((tier, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <label className="text-sm text-muted-foreground w-16">Min Qty</label>
                    <input
                      type="number"
                      value={tier.minQty}
                      onChange={e => {
                        const v = parseInt(e.target.value)
                        if (!isNaN(v)) {
                          const updated = [...quantityDiscounts]
                          updated[i] = { ...updated[i], minQty: v }
                          setQuantityDiscounts(updated)
                        }
                      }}
                      className={smallInputClass}
                    />
                    <label className="text-sm text-muted-foreground w-16">Discount</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tier.discount}
                        onChange={e => {
                          const v = parseFloat(e.target.value)
                          if (!isNaN(v)) {
                            const updated = [...quantityDiscounts]
                            updated[i] = { ...updated[i], discount: v }
                            setQuantityDiscounts(updated)
                          }
                        }}
                        className={smallInputClass}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save / Reset */}
            <div className="flex items-center gap-4">
              <button onClick={savePricing} className="btn-primary text-sm">
                Save Changes
              </button>
              <button onClick={resetPricing} className="btn-secondary text-sm">
                Reset to Defaults
              </button>
              {pricingSaved && <span className="text-sm text-primary">Saved.</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              Pricing changes are saved locally. To update live prices, contact your developer.
            </p>
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

        {/* Tab: Analytics */}
        {tab === 'analytics' && (
          <div className="space-y-6 pb-12">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                <p className="text-xs text-muted-foreground mb-1">Top Material</p>
                <p className="text-2xl font-bold text-muted-foreground">--</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {analytics.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders found in local storage.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.orders.slice(-10).reverse().map((o: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-2 text-sm">
                      <span>{o?.name || o?.email || `Order #${i + 1}`}</span>
                      <span className="text-muted-foreground">${Number(o?.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Analytics are based on local browser data. For full analytics, connect Google Analytics.
            </p>

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
