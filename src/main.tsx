import { MotionConfig } from 'framer-motion'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'
import { prepareInitialRoute } from './lib/bootRoutes'

async function start() {
  await prepareInitialRoute(window.location.pathname)
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
)
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
