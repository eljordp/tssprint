import { supabase } from './supabase'

export async function signInWithMigration(email: string, password: string) {
  const credentials = { email: email.trim().toLowerCase(), password }
  const result = await supabase.auth.signInWithPassword(credentials)
  if (!result.error || result.error.code !== 'invalid_credentials') return result
  try {
    const response = await fetch('/api/auth/migrate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (response.ok && (await response.json()).migrated) return supabase.auth.signInWithPassword(credentials)
  } catch { /* Preserve the normal sign-in error and password recovery option. */ }
  return result
}
