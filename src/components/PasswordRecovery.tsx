import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function PasswordRecovery({ reset }: { reset: boolean }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [checking, setChecking] = useState(reset)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!reset) return
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === 'PASSWORD_RECOVERY' && session) { setSessionReady(true); setChecking(false) }
    })
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      const callbackError = new URLSearchParams(window.location.hash.slice(1)).has('error')
      setSessionReady(Boolean(data.session) && !error && !callbackError)
      setChecking(false)
    }).catch(() => { if (active) { setChecking(false); setError('We could not check this link. Try opening the latest reset email again.') } })
    return () => { active = false; subscription.unsubscribe() }
  }, [reset])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setError('')
    if (reset && (password.length < 8 || password !== confirmation)) { setError('Use at least 8 characters and make sure both passwords match.'); return }
    setBusy(true)
    try {
      if (reset) {
        if (!sessionReady) throw new Error('This reset link has expired. Request a new one below.')
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        await supabase.auth.signOut({ scope: 'local' })
        navigate('/account?password=updated', { replace: true })
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/account?mode=recovery` })
        if (error) throw error
        setSent(true)
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not connect. Please try again.') }
    finally { setBusy(false) }
  }
  return <section className="section-container max-w-md py-12">
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <h1 className="text-2xl font-black">{reset ? 'Choose a new password' : 'Reset your password'}</h1>
      {checking ? <p role="status">Checking your reset link…</p> : reset && !sessionReady ? <div className="space-y-4"><p>This link is missing, invalid or expired. Request a fresh link and open the latest email.</p><Link to="/account?mode=forgot" className="text-primary font-bold">Request a new reset link</Link></div> : sent ? <div role="status"><p>If an account matches that email, you’ll receive a password reset link.</p><p className="mt-2 text-sm text-muted-foreground">Check spam and use the most recent email.</p><button className="text-primary mt-4" onClick={() => setSent(false)}>Try again or use another email</button></div> : <form onSubmit={submit} className="space-y-4">
        {reset ? <><label className="block text-sm">New password<input className="input-base mt-2" type="password" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required /></label><label className="block text-sm">Confirm new password<input className="input-base mt-2" type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} required /></label></> : <label className="block text-sm">Account email<input type="email" autoComplete="email" className="input-base mt-2" value={email} onChange={event => setEmail(event.target.value)} required /></label>}
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Please wait…' : reset ? 'Save new password' : 'Send reset link'}</button>
      </form>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Link to="/account" className="block text-primary text-sm">Back to login</Link>
      <Link to="/stickers#configure" className="block text-sm text-muted-foreground">You can still shop and check out as a guest.</Link>
    </div>
  </section>
}
