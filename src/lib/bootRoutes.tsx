import { lazy, type ComponentType } from 'react'

const loaders = new Map<string, () => Promise<void>>()

// Resolve the first route before React takes over the existing HTML. Later
// routes stay lazy, while the first render no longer commits a blank fallback.
export function bootRoute<Props extends object>(name: string, load: () => Promise<{ default: ComponentType<Props> }>) {
  let Component: ComponentType<Props> = lazy(load)
  loaders.set(name, async () => { Component = (await load()).default })
  return function ReadyRoute(props: Props) { return <Component {...props} /> }
}

export async function prepareInitialRoute(pathname: string) {
  const pages: Record<string, string> = {
    '/': 'Home', '/stickers': 'Order', '/services': 'Services',
    '/services/vehicle-graphics': 'VehicleGraphics', '/services/business-signage': 'BusinessSignage',
    '/services/event-displays': 'EventDisplays', '/services/business-print': 'BusinessPrint',
    '/services/window-film': 'BusinessSignage', '/mylar': 'MylarPackaging', '/projects': 'Projects',
    '/case-studies': 'Projects', '/about': 'About', '/contact': 'Contact', '/quote': 'Contact',
    '/referral': 'Referral', '/order-help': 'OrderHelp', '/terms': 'Legal', '/privacy': 'Legal',
    '/cart': 'Cart', '/checkout': 'Checkout', '/account': 'Account', '/admin': 'Admin',
    '/payment-status': 'PaymentStatus', '/order-confirmation': 'OrderConfirmation',
  }
  const path = pathname.replace(/\/$/, '') || '/'
  const page = pages[path] ?? (path.startsWith('/case-studies/') ? 'CaseStudyDetail'
    : /^\/(die-cut-stickers|sticker-sheets|roll-labels|holographic-stickers|custom-labels)$/.test(path) ? 'StickerSupportPage'
      : /^\/(hayward|oakland|san-leandro|castro-valley|union-city|fremont|san-lorenzo|newark)$/.test(path) ? 'CityPage' : 'NotFound')
  await loaders.get(page)?.()
}
