import { supabase } from './supabase'

// Generate or retrieve a persistent visitor ID
function getVisitorId(): string {
  let id = localStorage.getItem('tss-visitor-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('tss-visitor-id', id)
  }
  return id
}

// Generate a session ID (refreshes after 30 min inactivity)
function getSessionId(): string {
  const now = Date.now()
  const stored = localStorage.getItem('tss-session')
  if (stored) {
    const { id, ts } = JSON.parse(stored)
    if (now - ts < 30 * 60 * 1000) {
      localStorage.setItem('tss-session', JSON.stringify({ id, ts: now }))
      return id
    }
  }
  const id = crypto.randomUUID()
  localStorage.setItem('tss-session', JSON.stringify({ id, ts: now }))
  return id
}

let lastPath = ''
let lastPathTime = Date.now()

export function trackPageView(path: string) {
  const visitorId = getVisitorId()
  const sessionId = getSessionId()

  // Log navigation from previous page
  if (lastPath && lastPath !== path) {
    const duration = Date.now() - lastPathTime
    supabase.from('nav_events').insert({
      from_path: lastPath,
      to_path: path,
      session_id: sessionId,
      visitor_id: visitorId,
      duration_ms: duration,
    }).then(() => {})
  }

  lastPath = path
  lastPathTime = Date.now()

  supabase.from('page_views').insert({
    path,
    referrer: document.referrer || null,
    session_id: sessionId,
    visitor_id: visitorId,
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
  }).then(() => {})
}

export function trackClick(path: string, element: string, x: number, y: number) {
  const visitorId = getVisitorId()
  const sessionId = getSessionId()

  // Convert to percentage of viewport
  const xPercent = (x / window.innerWidth) * 100
  const yPercent = (y / window.innerHeight) * 100

  supabase.from('click_events').insert({
    path,
    element,
    x_percent: Math.round(xPercent * 100) / 100,
    y_percent: Math.round(yPercent * 100) / 100,
    session_id: sessionId,
    visitor_id: visitorId,
  }).then(() => {})
}

// Get a readable element identifier from a click target
function getElementId(el: HTMLElement): string {
  if (el.id) return `#${el.id}`
  if (el.dataset.track) return el.dataset.track
  const tag = el.tagName.toLowerCase()
  const cls = el.className && typeof el.className === 'string'
    ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.')
    : ''
  const text = el.textContent?.trim().substring(0, 30) || ''
  return `${tag}${cls}${text ? ` "${text}"` : ''}`
}

// Auto-track clicks on interactive elements
export function setupClickTracking() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target) return

    // Only track clicks on interactive elements
    const interactive = target.closest('a, button, [role="button"], [data-track], input[type="submit"]')
    if (!interactive) return

    trackClick(
      window.location.pathname,
      getElementId(interactive as HTMLElement),
      e.clientX,
      e.clientY
    )
  }, { passive: true })
}
