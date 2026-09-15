import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resolveProductEdit, type ProductConfiguration } from '@/lib/productCartEditing'
import { trackEvent } from '@/lib/analytics'
import { useEffect, useRef, useState } from 'react'
import { ShoppingCart, Check, Plus, Sparkles, ArrowRight } from 'lucide-react'
import { useCart, type CartItem } from '@/context/CartContext'
import { getPricing, loadPricing, type ProductCategory, type ProductTier, type PricingConfig } from '@/lib/pricing'

import ProductExample from '@/components/ProductExample'
import ProductExampleMedia from '@/components/ProductExampleMedia'
import { getProductExample } from '@/lib/productExamples'
import ProductionArtwork, { type ArtworkSelection } from '@/components/ProductionArtwork'

interface Props {
  artworkFirst?: boolean
  onArtworkChange?: (value: ArtworkSelection) => void
  categoryNames: string[]
  onCategoryChange?: (categoryName: string) => void
  checkoutMode?: 'cart' | 'estimate'
  onEstimateRequest?: (summary: string) => void
}

/** Group items by their prefix before " – " */
function groupItems(items: ProductTier[]) {
  const groups: { label: string; items: { item: ProductTier; globalIndex: number }[] }[] = []
  const map = new Map<string, { item: ProductTier; globalIndex: number }[]>()
  items.forEach((item, i) => {
    const dashIdx = item.size.indexOf(' – ')
    const prefix = dashIdx > -1 ? item.size.substring(0, dashIdx) : item.size
    if (!map.has(prefix)) {
      const arr: { item: ProductTier; globalIndex: number }[] = []
      map.set(prefix, arr)
      groups.push({ label: prefix, items: arr })
    }
    map.get(prefix)!.push({ item, globalIndex: i })
  })
  return groups
}

/** Detect if a category supports custom quantity (bulk items with high qty tiers) */
function isBulkCategory(cat: ProductCategory): boolean {
  return cat.items.some(item => item.quantities.some(q => q.qty >= 50))
}

const TOTAL_TIER_CATEGORIES = new Set([
  'Business Cards',
  'Flyers & Door Hangers',
  'Postcards',
])

function usesTotalTierPricing(cat: ProductCategory): boolean {
  return TOTAL_TIER_CATEGORIES.has(cat.name)
}

/** Find the best tier for a given qty (highest tier whose qty <= input) */
function findTier(quantities: { qty: number; price: number }[], qty: number) {
  const sorted = [...quantities].sort((a, b) => a.qty - b.qty)
  let tier = sorted[0]
  for (const t of sorted) {
    if (qty >= t.qty) tier = t
  }
  return tier
}

function createCartItemId(categoryName: string, size: string) {
  return `${categoryName}-${size}-${Date.now()}`
}

export default function ProductOrder(props: Props) {
  const { items } = useCart()
  const [searchParams] = useSearchParams()
  const editId = props.checkoutMode === 'estimate' ? null : searchParams.get('edit')
  const editingItem = items.find(item => item.id === editId)
  const returnTo = searchParams.get('returnTo') === 'checkout' ? '/checkout' : '/cart'
  const [pricing, setPricing] = useState(() => getPricing())
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let active = true
    loadPricing().then(config => { if (active) { setPricing(config); setLoaded(true) } })
    return () => { active = false }
  }, [])
  if (editId && !loaded) return <p role="status" className="p-6">Loading your saved options…</p>
  const editConfig = editingItem && resolveProductEdit(editingItem, pricing.products.filter(c => props.categoryNames.includes(c.name)))
  if (editId && (!editConfig || editConfig.kind !== 'catalog')) return <div role="alert" className="p-6 rounded-xl border border-border"><p>{editingItem ? 'We could not restore these product options. Your original item is still in the cart. Contact the shop or remove it only when you are ready to replace it.' : 'This item is no longer in your cart.'}</p><Link to="/cart" className="btn-primary mt-4">Back to cart</Link></div>
  return <ProductOrderForm key={editId || 'new'} {...props} pricing={pricing} editingItem={editingItem} editConfig={editConfig || undefined} returnTo={returnTo} />
}

function ProductOrderForm({ categoryNames, onCategoryChange, checkoutMode = 'cart', onEstimateRequest, artworkFirst = false, onArtworkChange, pricing, editingItem, editConfig, returnTo }: Props & { pricing: PricingConfig; editingItem?: CartItem; editConfig?: ProductConfiguration; returnTo: string }) {
  const { addItem, replaceItem } = useCart()
  const navigate = useNavigate()
  const trackedCategory = categoryNames.join('|')
  useEffect(() => { trackEvent('view_item', { product: trackedCategory }) }, [trackedCategory])
  const categories = categoryNames
    .map(name => pricing.products.find(p => p.name === name))
    .filter((c): c is ProductCategory => !!c)

  const initialCategory = Math.max(0, categories.findIndex(c => c.name === editConfig?.category))
  const initialItem = Math.max(0, categories[initialCategory]?.items.findIndex(v => v.size === editConfig?.variant) ?? 0)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [selectedItem, setSelectedItem] = useState(initialItem)
  const [selectedQtyIndex, setSelectedQtyIndex] = useState(Math.max(0, categories[initialCategory]?.items[initialItem]?.quantities.findIndex(q => q.qty === editConfig?.pieces) ?? 0))
  const [customQty, setCustomQty] = useState(editConfig?.pieces || 250)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(() => new Set(editConfig?.addOns || []))
  const [added, setAdded] = useState(false)
  const [optionNotice, setOptionNotice] = useState('')
  const [activeGroup, setActiveGroup] = useState(Math.max(0, groupItems(categories[initialCategory]?.items || []).findIndex(g => g.items.some(v => v.globalIndex === initialItem))))

  const [artwork, setArtwork] = useState<ArtworkSelection>({ status: editingItem?.artwork ? 'uploaded' : 'idle', artwork: editingItem?.artwork })
  const orderRegion = useRef<HTMLDivElement>(null)
  const [orderVisible, setOrderVisible] = useState(false)
  useEffect(() => {
    const target = orderRegion.current
    if (!artworkFirst || !target) return
    const observer = new IntersectionObserver(([entry]) => setOrderVisible(entry.isIntersecting))
    observer.observe(target)
    return () => observer.disconnect()
  }, [artworkFirst])

  const category = categories[activeCategory]
  const item = category?.items[selectedItem]
  const groups = category ? groupItems(category.items) : []

  useEffect(() => {
    if (category) onCategoryChange?.(category.name)
  }, [category, onCategoryChange])

  if (!category || !item) return null

  const totalTierPricing = usesTotalTierPricing(category)
  const bulk = isBulkCategory(category) && !totalTierPricing
  const hasGroups = groups.length > 1 || groups[0]?.label !== groups[0]?.items[0]?.item.size

  // Quantity & pricing
  const qtyOption = bulk
    ? findTier(item.quantities, customQty)
    : (item.quantities[selectedQtyIndex] || item.quantities[0])
  const effectiveQty = bulk ? customQty : qtyOption.qty
  const unitPrice = qtyOption.price
  const addOnTotal = category.addOns
    .filter(a => selectedAddOns.has(a.name))
    .reduce((sum, a) => sum + a.value, 0)

  // For bulk (per-unit pricing): total = (unitPrice + addOns) * qty
  // For fixed (per-project pricing): total = price + addOns
  const isPerUnit = !totalTierPricing && (bulk || item.quantities.length > 1)
  const totalPrice = isPerUnit
    ? +((unitPrice + addOnTotal) * effectiveQty).toFixed(2)
    : +(unitPrice + addOnTotal).toFixed(2)
  const cartBasePrice = isPerUnit
    ? +(unitPrice * effectiveQty).toFixed(2)
    : +unitPrice.toFixed(2)

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const minimumQty = bulk ? Math.min(...item.quantities.map(q => q.qty)) : 1
  const quantityInvalid = !Number.isInteger(effectiveQty) || effectiveQty < minimumQty || effectiveQty > 100000
  const artworkBlocked = artworkFirst && (artwork.status === 'uploading' || artwork.status === 'error')
  const handleAddToCart = () => {
    if (artworkBlocked || quantityInvalid) return
    const addOns = category.addOns
      .filter(a => selectedAddOns.has(a.name))
      .map(a => ({ name: a.name, price: +(a.value * (isPerUnit ? effectiveQty : 1)).toFixed(2) }))

    const nextItem = {
      id: editingItem?.id || createCartItemId(category.name, item.size),
      productConfiguration: { version: 1 as const, kind: 'catalog' as const, category: category.name, variant: item.size, pieces: effectiveQty, addOns: [...selectedAddOns] },
      name: `${category.name} — ${item.size}`,
      category: category.name,
      artworkIntent: 'send_later' as const,
      pieceCount: effectiveQty,
      size: item.size,
      option: effectiveQty > 1 ? `${effectiveQty} pcs` : '1',
      price: cartBasePrice,
      quantity: 1,
      ...(artworkFirst ? { artworkIntent: artwork.artwork ? 'uploaded' as const : 'send_later' as const, artwork: artwork.artwork } : {}),
      addOns: addOns.length > 0 ? addOns : undefined,
    }
    if (editingItem) { replaceItem(editingItem.id, nextItem); navigate(returnTo); return }
    addItem(nextItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleEstimateRequest = () => {
    if (artworkBlocked || quantityInvalid) return
    const summary = [
      `${category.name}: ${item.size}`,
      effectiveQty > 1 ? `Quantity: ${effectiveQty}` : null,
      selectedAddOns.size > 0 ? `Options: ${Array.from(selectedAddOns).join(', ')}` : null,
      `Price guide shown: $${totalPrice.toFixed(2)}`,
    ].filter(Boolean).join('\n')
    onEstimateRequest?.(summary)
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const resetSelections = (catIdx: number) => {
    if (catIdx === activeCategory) return
    if (!editingItem) { setArtwork({ status: 'idle' }); onArtworkChange?.({ status: 'idle' }) }
    if (selectedAddOns.size) setOptionNotice('Product changed. Previous upgrades were removed; choose the options for this product below.')
    setActiveCategory(catIdx)
    setSelectedItem(0)
    setSelectedQtyIndex(0)
    setCustomQty(250)
    setSelectedAddOns(new Set())
    setActiveGroup(0)
  }

  const displayName = (size: string) => {
    const dashIdx = size.indexOf(' – ')
    return dashIdx > -1 ? size.substring(dashIdx + 3) : size
  }

  return (
    <div
      ref={orderRegion}
      className={artworkFirst ? "max-w-6xl mx-auto pb-20 md:pb-0" : "max-w-5xl mx-auto"}
    >
      {editingItem && <div className="mb-5 rounded-xl border border-primary/40 bg-primary/5 p-4"><p className="font-bold">Edit {editingItem.name}</p><p className="text-sm text-muted-foreground">Keeping {editingItem.quantity} {editingItem.quantity === 1 ? 'batch' : 'batches'}. Prices below are for one batch. Changes are applied when you save.</p><p className="text-sm mt-2" role="status">Updated subtotal: ${(totalPrice * editingItem.quantity).toFixed(2)} for all batches, before cart discounts.</p><Link to={returnTo} className="inline-block mt-3 text-primary font-semibold underline">Cancel editing</Link></div>}
      {optionNotice && <p role="status" className="mb-4 text-sm text-primary">{optionNotice}</p>}
      <h2 className={artworkFirst ? "sr-only" : "text-2xl md:text-3xl font-black mb-2 text-center"}>
        {checkoutMode === 'estimate' ? 'Choose your signage or display' : 'Shop Products'}
      </h2>
      {checkoutMode === 'estimate' && (
        <p className="mx-auto mb-6 max-w-2xl text-center text-sm text-muted-foreground">
          Choose a product to see examples and a starting price. We confirm dimensions, artwork, installation and hardware in your exact estimate.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" aria-label="Choose a product category">
        {categories.map((cat, i) => {
          const example = getProductExample(cat.name)
          return <button type="button" key={cat.name} onClick={() => resetSelections(i)} aria-pressed={activeCategory === i}
            className={`text-left rounded-xl border overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-primary ${activeCategory === i ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
            {example && <ProductExampleMedia example={example} thumbnail priority={i === 0} />}
            <span className="block p-3 text-sm font-bold">{cat.name === 'Event Displays' ? 'Canopy Tents' : cat.name}</span>
          </button>
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
        {artworkFirst && <div className="md:sticky md:top-24 space-y-4">
          <ProductExample category={category.name} />
          <details className="rounded-2xl border border-border bg-card p-4" key={category.name}>
            <summary className="cursor-pointer text-sm font-bold">{artwork.artwork ? 'Artwork attached · view or change' : 'Have artwork? Add it here (optional)'}</summary>
            <div className="mt-4"><ProductionArtwork key={editingItem?.id || category.name} initialArtwork={editingItem?.artwork} size={item.size} purpose={checkoutMode === 'estimate' ? 'quote' : 'order'} onChange={value => { setArtwork(value); onArtworkChange?.(value) }} /></div>
          </details>
          <p className="text-sm text-muted-foreground">We review your artwork and email a proof before printing. You can send the file later.</p>
        </div>}
        <div className={artworkFirst ? 'space-y-4' : 'contents'}>
        {/* Product selection */}
        <div className="space-y-6">
          {/* Products - grouped by sub-category */}
          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Select Product</label>
            {artworkFirst ? (
              <select aria-label="Select product" value={selectedItem} onChange={event => { setSelectedItem(Number(event.target.value)); setSelectedQtyIndex(0) }} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm">
                {category.items.map((product, index) => <option key={product.size} value={index}>{product.size}</option>)}
              </select>
            ) : hasGroups ? (
              <div className="space-y-4">
                {/* Sub-category filter buttons */}
                <div className="flex flex-wrap gap-2">
                  {groups.map((group, gi) => (
                    <button
                      key={group.label}
                      onClick={() => {
                        setActiveGroup(gi)
                        const firstItem = groups[gi].items[0]
                        if (firstItem) { setSelectedItem(firstItem.globalIndex); setSelectedQtyIndex(0) }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        activeGroup === gi
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
                {/* Items for active sub-group */}
                <div className="grid gap-2">
                  {(groups[activeGroup]?.items || []).map(({ item: p, globalIndex }) => (
                    <button
                      key={p.size}
                      onClick={() => { setSelectedItem(globalIndex); setSelectedQtyIndex(0) }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                        selectedItem === globalIndex
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{displayName(p.size)}</span>
                      <span className="float-right text-muted-foreground">
                        from ${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                {category.items.map((p, i) => (
                  <button
                    key={p.size}
                    onClick={() => { setSelectedItem(i); setSelectedQtyIndex(0) }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                      selectedItem === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <span>{p.size}</span>
                    <span className="float-right text-muted-foreground">
                      {p.quantities.length === 1 && p.quantities[0].qty === 1
                        ? `$${p.quantities[0].price.toFixed(2)}`
                        : totalTierPricing
                          ? `from $${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}`
                          : `from $${Math.min(...p.quantities.map(q => q.price)).toFixed(2)}/ea`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity - smart calculator for bulk, buttons for per-unit */}
          <div>
            <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Quantity</label>
            {bulk ? (
              <div>
                <input
                  type="number"
                  min={minimumQty}
                  max={100000}
                  step={1}
                  aria-label="Product quantity" aria-invalid={quantityInvalid}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3"
                  value={customQty}
                  onChange={e => setCustomQty(Number(e.target.value) || 0)}
                  placeholder="Enter quantity"
                />
                {/* Show tier breakdown */}
                <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-xs space-y-1">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Price Tiers</p>
                  {item.quantities.map((q, i) => {
                    const nextQty = item.quantities[i + 1]?.qty
                    const label = nextQty ? `${q.qty}–${nextQty - 1}` : `${q.qty}+`
                    const isActive = qtyOption.qty === q.qty
                    return (
                      <div key={q.qty} className={`flex justify-between ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        <span>{label} pcs</span>
                        <span>${q.price.toFixed(2)}/ea</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : item.quantities.length === 1 && item.quantities[0].qty === 1 ? (
              <div className="px-4 py-3 rounded-xl text-sm font-medium border border-primary bg-primary/10 text-primary text-center">
                One project · scope confirmed in your estimate
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.quantities.map((q, i) => (
                  <button
                    key={q.qty}
                    onClick={() => setSelectedQtyIndex(i)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                      selectedQtyIndex === i
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="font-bold">{q.qty}{q.qty > 1 ? ' pcs' : ''}</div>
                    <div className="text-xs mt-0.5 text-muted-foreground">
                      ${q.price.toFixed(2)}{totalTierPricing ? ' total' : '/ea'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {quantityInvalid && <p role="alert" className="text-sm text-red-400">Enter a whole quantity from {minimumQty} to 100,000.</p>}
          {/* Add-Ons */}
          {category.addOns.length > 0 && (
            <details open={artworkFirst ? undefined : true} className="rounded-2xl border border-border bg-card p-4">
              <summary className="flex items-center gap-2 cursor-pointer">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-bold uppercase tracking-wider">Options & finishes{selectedAddOns.size > 0 ? ` (${selectedAddOns.size})` : ""}</span><Plus size={14} className="ml-auto" />
              </summary>
              <p className="text-xs text-muted-foreground my-4">Optional upgrades are added to the price below.</p>
              <div className="grid grid-cols-2 gap-2">
                {category.addOns.map(addon => (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddOn(addon.name)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left flex items-center gap-2 ${
                      selectedAddOns.has(addon.name)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    {selectedAddOns.has(addon.name) ? <Check size={14} /> : <Plus size={14} className="text-muted-foreground" />}
                    <div>
                      <div>{addon.name}</div>
                      <div className="text-xs text-muted-foreground">+${addon.value.toFixed(2)}{isPerUnit ? '/ea' : ''}</div>
                    </div>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            {artworkFirst && <p className="text-xs text-muted-foreground mb-3">{artwork.artwork ? 'Production artwork attached' : artworkBlocked ? 'Finish uploading or choose send later' : checkoutMode === 'estimate' ? 'Artwork can follow with your project details' : 'Artwork: send after ordering'}</p>}
            <h3 className="font-bold text-lg mb-4">{checkoutMode === 'estimate' ? 'Estimate Summary' : 'Order Summary'}</h3>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="text-right max-w-[60%]">{category.name} · {item.size}</span>
              </div>
              {effectiveQty > 1 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity</span>
                  <span>{effectiveQty.toLocaleString()} pcs</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isPerUnit ? 'Unit Price' : 'Price'}</span>
                <span>${unitPrice.toFixed(2)}{isPerUnit ? '/ea' : ''}</span>
              </div>
              {selectedAddOns.size > 0 && (
                <>
                  <div className="border-t border-border pt-2 mt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add-Ons</span>
                  </div>
                  {category.addOns
                    .filter(a => selectedAddOns.has(a.name))
                    .map(a => (
                      <div key={a.name} className="flex justify-between">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span>+${a.value.toFixed(2)}{isPerUnit ? '/ea' : ''}</span>
                      </div>
                    ))}
                </>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>{checkoutMode === 'estimate' ? 'Price Guide' : 'Subtotal'}</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            {checkoutMode === 'cart' && <p className="mb-4 text-xs text-muted-foreground">Cart discounts and any applicable tax appear at checkout.</p>}
            {checkoutMode === 'estimate' ? (
              <>
                <button
                  type="button"
                  onClick={handleEstimateRequest}
                  disabled={artworkBlocked || quantityInvalid}
                  className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Exact Estimate <ArrowRight size={18} />
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">No payment now. We confirm the exact scope first.</p>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={artworkBlocked || quantityInvalid}
                className={`btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed ${added ? 'bg-green-600' : ''}`}
              >
                {added ? (
                  <>Added to Cart! <Check size={18} /></>
                ) : (
                  <>{editingItem ? 'Save changes' : 'Add to Cart'} — ${totalPrice.toFixed(2)} <ShoppingCart size={18} /></>
                )}
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
      {artworkFirst && orderVisible && <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] flex items-center gap-4">
        <div className="shrink-0"><p className="font-bold text-lg">${totalPrice.toFixed(2)}</p><p className="text-xs text-muted-foreground">{checkoutMode === 'estimate' ? 'Starting price' : quantityInvalid ? 'Enter a whole quantity' : `${effectiveQty} pcs · $${(totalPrice / effectiveQty).toFixed(2)}/ea`}</p></div>
        <button type="button" onClick={checkoutMode === "estimate" ? handleEstimateRequest : handleAddToCart} disabled={artworkBlocked || quantityInvalid} className="btn-primary flex-1 justify-center disabled:opacity-50">{artwork.status === 'uploading' ? 'Uploading…' : checkoutMode === 'estimate' ? 'Get Estimate' : added ? 'Added!' : editingItem ? 'Save changes' : 'Add to Cart'}</button>
      </div>}
    </div>
  )
}
