import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'
import { prepareInitialRoute } from './lib/bootRoutes'

async function start() {
  const root = document.getElementById('root')!
  // Let already-rendered content reach the screen before hydration work begins.
  // Empty app shells still start immediately.
  if (root.dataset.reactSsr === 'true' && document.visibilityState === 'visible') {
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  }
  await prepareInitialRoute(window.location.pathname)
  const app = <StrictMode>
    <MotionConfig reducedMotion="user"><App /></MotionConfig>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(220 15% 12%)',
          border: '1px solid hsl(220 10% 20%)',
          color: 'hsl(220 15% 95%)',
        },
      }}
    />
  </StrictMode>
  const buildWindow = window as unknown as { __prerender?: boolean; __initialHtml?: string }
  if (buildWindow.__prerender && ['/', '/stickers', '/services/business-signage'].includes(window.location.pathname)) {
    // Generate React's hydration markers, not a snapshot of an already mounted DOM.
    const { renderToString } = await import('react-dom/server.browser')
    buildWindow.__initialHtml = renderToString(app)
  }
  let canHydrate = root.dataset.reactSsr === 'true'
  try {
    // Saved configurations and personalized query options differ from the public HTML.
    const cart = JSON.parse(localStorage.getItem('tss-cart') || '[]')
    const query = [...new URLSearchParams(window.location.search).keys()]
    canHydrate &&= Array.isArray(cart) && cart.length === 0 && !localStorage.getItem('tss-pricing')
      && query.every(key => key.startsWith('utm_') || ['analytics_debug', 'gclid', 'fbclid'].includes(key))
  } catch { canHydrate = false }
  if (canHydrate) hydrateRoot(root, app)
  else createRoot(root).render(app)
}

void start().catch(() => {
  // Keep readable server content in place if a route chunk cannot be fetched.
  const notice = document.createElement('div')
  notice.setAttribute('role', 'alert')
  notice.className = 'fixed bottom-0 inset-x-0 z-[100] bg-background border-t border-border p-4 text-center'
  notice.textContent = 'The page could not finish loading. Check your connection and '
  const retry = document.createElement('button')
  retry.type = 'button'
  retry.className = 'underline min-h-11 px-2'
  retry.textContent = 'reload the page.'
  retry.addEventListener('click', () => window.location.reload())
  notice.append(retry)
  document.body.append(notice)
})
