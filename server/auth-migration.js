import { createClient } from '@supabase/supabase-js'
import { consumeRateLimit, requireTrustedBrowserRequest } from './request-guards.js'
const options = { auth: { persistSession: false, autoRefreshToken: false } }
const reply = (res, code, data) => { res.setHeader('Cache-Control', 'no-store'); return res.status(code).json(data) }
export async function migratePassword({ email, password, legacy, destination }) {
  // The old project must authenticate the password; importing an email alone is insufficient.
  const old = await legacy.auth.signInWithPassword({ email, password })
  if (old.error || !old.data.user) return false
  const id = old.data.user.id
  try {
    if (old.data.user.factors?.some(f => f.status === 'verified')) return false
    const { data, error } = await destination.auth.admin.getUserById(id)
    const user = data?.user
    // Once the new account has been used, an old password can never overwrite it.
    if (error || !user || user.email?.toLowerCase() !== email || user.last_sign_in_at ||
        user.app_metadata?.tss_migrated_from !== 'frhxzzlycfhcobslksxg' ||
        user.app_metadata?.tss_password_migration_pending !== true) return false
    const updated = await destination.auth.admin.updateUserById(id, {
      password,
      app_metadata: { ...user.app_metadata, tss_password_migration_pending: false },
    })
    return !updated.error
  } finally {
    // Revoke only the temporary session used for this migration attempt.
    await legacy.auth.signOut({ scope: 'local' }).catch(() => {})
  }
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' })
  try {
    requireTrustedBrowserRequest(req)
    const rate = consumeRateLimit(req, { key: 'account-migration', limit: 5, windowMs: 60000 })
    if (!rate.allowed) { res.setHeader('Retry-After', String(rate.retryAfter)); return reply(res, 429, { error: 'Please wait a minute before trying again.' }) }
    if (process.env.LEGACY_AUTH_MIGRATION_ENABLED !== 'true') return reply(res, 404, { migrated: false })
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = body?.password
    if (!email || email.length > 254 || typeof password !== 'string' || !password || password.length > 1024) return reply(res, 400, { migrated: false })
    const legacy = createClient('https://frhxzzlycfhcobslksxg.supabase.co', process.env.LEGACY_SUPABASE_ANON_KEY, options)
    const destination = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options)
    const migrated = await migratePassword({ email, password, legacy, destination })
    return reply(res, migrated ? 200 : 401, { migrated })
  } catch { return reply(res, 401, { migrated: false }) }
}
