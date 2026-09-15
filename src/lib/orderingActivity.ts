export type OrderingSignal = {
  visitor_id: string | null
  session_id: string | null
  event_type: string | null
  created_at: string
}

// Count ordered milestones within a browser session. Cart-page views and
// uploads are optional, so neither is a prerequisite for reaching checkout.
export function orderingActivity(signals: OrderingSignal[]) {
  const stages = ['view_item', 'add_to_cart', 'begin_checkout'] as const
  const sessions = new Map<string, number>()
  const uploadSessions = new Map<string, Set<string>>()
  const sorted = signals.filter(s => s.visitor_id && s.session_id && Number.isFinite(Date.parse(s.created_at)))
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
  for (const signal of sorted) {
    const key = JSON.stringify([signal.visitor_id, signal.session_id])
    const completed = sessions.get(key) || 0
    if (signal.event_type === stages[completed]) sessions.set(key, completed + 1)
    if (['artwork_upload_started', 'artwork_upload_succeeded', 'artwork_upload_failed'].includes(signal.event_type || '')) {
      const seen = uploadSessions.get(key) || new Set<string>()
      seen.add(signal.event_type!)
      uploadSessions.set(key, seen)
    }
  }
  const labels = ['Viewed a product', 'Then added an item', 'Then started checkout']
  return {
    stages: labels.map((label, i) => ({ label, count: [...sessions.values()].filter(n => n > i).length })),
    uploads: [
      { label: 'Started an upload', event: 'artwork_upload_started' },
      { label: 'Had a successful upload', event: 'artwork_upload_succeeded' },
      { label: 'Had an upload failure', event: 'artwork_upload_failed' },
    ].map(({ label, event }) => ({ label, count: [...uploadSessions.values()].filter(events => events.has(event)).length })),
    unidentified: signals.filter(s => !s.visitor_id || !s.session_id || !Number.isFinite(Date.parse(s.created_at))).length,
  }
}
