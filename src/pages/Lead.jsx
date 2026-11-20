import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { configured } from '../lib/supabase'
import { submitLead } from '../lib/cloud'
import { Mark } from '../components/Logo'

// The public form a visitor sees. No account needed. It files them as a contact in the owner's Kept.
export default function Lead() {
  const { token } = useParams()
  const [f, setF] = useState({ name: '', email: '', message: '', website: '' })
  const [state, setState] = useState('idle'), [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (f.website) return setState('done') // a hidden field only robots fill in
    if (!f.name.trim()) return setErr('Please tell us your name.')
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr('That email does not look right.')
    setState('sending'); setErr('')
    try { await submitLead({ token, name: f.name, email: f.email, message: f.message }); setState('done') } catch (x) { setErr(x.message); setState('idle') }
  }
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-5 py-10">
      {state === 'done' ? (
        <div className="mt-16"><h1 className="h text-[clamp(4rem,16vw,10rem)]">Thank you<span style={{ color: 'var(--red)' }}>.</span></h1><p className="text-2xl mt-6 font-medium">Your message is in. You will hear back soon.</p></div>
      ) : !configured ? <p className="text-xl mt-16">This form is not available right now.</p> : (
        <>
          <h1 className="h text-[clamp(4rem,16vw,10rem)] mt-8">Say hello<span style={{ color: 'var(--red)' }}>.</span></h1>
          <form onSubmit={submit} className="mt-10 space-y-5 border-t-4 rule pt-6">
            <label className="block font-semibold">Your name<input className="in mt-1 !text-xl" value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <label className="block font-semibold">Email<input type="email" className="in mt-1 !text-xl" value={f.email} onChange={set('email')} autoComplete="email" /></label>
            <label className="block font-semibold">How can we help?<textarea className="in mt-1 !text-xl" rows={5} maxLength={1000} value={f.message} onChange={set('message')} /></label>
            <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.website} onChange={set('website')} />
            {err && <p role="alert" className="font-semibold" style={{ color: 'var(--red)' }}>{err}</p>}
            <button disabled={state === 'sending'} className="btn text-lg !px-8 !py-3.5">{state === 'sending' ? 'Sending' : 'Send'}</button>
          </form>
        </>
      )}
      <p className="label mt-16 flex items-center gap-2"><Mark size={16} />Made with <Link to="/" className="underline underline-offset-4">Kept</Link></p>
    </div>
  )
}
