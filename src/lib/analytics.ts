import { supabase } from './supabase'

// Generate or retrieve persistent visitor ID
function getVisitorId(): string {
  let id = localStorage.getItem('tss-visitor-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('tss-visitor-id', id)
  }
  return id
}

// Generate session ID (new per browser session)
function getSessionId(): string {
  let id = sessionStorage.getItem('tss-session-id')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('tss-session-id', id)
  }
  return id
}

export function trackPageView(path: string) {
  supabase.from('page_views').insert({
    path,
    referrer: document.referrer || null,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
  }).then(() => {})
}

export function trackNavEvent(fromPath: string, toPath: string, durationMs: number) {
  supabase.from('nav_events').insert({
    from_path: fromPath,
    to_path: toPath,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
    duration_ms: durationMs,
  }).then(() => {})
}

export function trackClickEvent(path: string, element: string, xPercent: number, yPercent: number) {
  supabase.from('click_events').insert({
    path,
    element,
    x_percent: xPercent,
    y_percent: yPercent,
    session_id: getSessionId(),
    visitor_id: getVisitorId(),
  }).then(() => {})
}
