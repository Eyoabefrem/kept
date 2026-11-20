import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { sendCode, verifyCode } = useAuth(), nav = useNavigate()
  const [email, setEmail] = useState(''), [code, setCode] = useState(''), [sent, setSent] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const send = async (e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter a valid email address.'); setBusy(true); setErr(''); const m = await sendCode(email.trim()); setBusy(false); m ? setErr(m) : setSent(true) }
  const verify = async (e) => { e.preventDefault(); setBusy(true); setErr(''); const m = await verifyCode(email.trim(), code.trim()); setBusy(false); m ? setErr(m) : nav('/app') }
  return (
    <div className="min-h-screen max-w-6xl mx-auto px-5 py-6">
      <Link to="/"><Logo /></Link>
      <div className="grid md:grid-cols-12 gap-10 mt-16 sm:mt-24">
        <h1 className="h text-[clamp(3.4rem,10vw,8rem)] md:col-span-7">{sent ? 'Check your email' : 'Take it with you'}<span style={{ color: 'var(--red)' }}>.</span></h1>
        <div className="md:col-span-5 border-t-4 rule pt-5">
          <p className="text-xl" style={{ color: 'var(--muted)' }}>{sent ? `We sent a code to ${email.trim()}.` : 'Enter your email and we will send a code. No password. A new email makes a new account, and your data follows you to every device.'}</p>
          {!sent ? (
            <form onSubmit={send} className="mt-6 space-y-4"><label className="block font-semibold">Email<input type="email" className="in mt-1" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus /></label>
              {err && <p role="alert" className="font-semibold" style={{ color: 'var(--red)' }}>{err}</p>}<button disabled={busy} className="btn">{busy ? 'Sending' : 'Send code'}</button></form>
          ) : (
            <form onSubmit={verify} className="mt-6 space-y-4"><label className="block font-semibold">Code<input className="in mt-1 text-center !text-3xl tracking-[.3em]" inputMode="numeric" maxLength={10} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus /></label>
              {err && <p role="alert" className="font-semibold" style={{ color: 'var(--red)' }}>{err}</p>}<button disabled={busy || code.length < 6} className="btn">{busy ? 'Checking' : 'Verify and continue'}</button>
              <button type="button" onClick={() => { setSent(false); setCode(''); setErr('') }} className="block font-semibold underline underline-offset-4">Use a different email</button></form>
          )}
          <p className="label mt-8"><Link to="/app" className="underline underline-offset-4">Skip for now</Link>. Everything works without an account.</p>
        </div>
      </div>
    </div>
  )
}
