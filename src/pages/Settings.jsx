import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import { useStore } from '../lib/store'
import { useAuth } from '../lib/auth'
import { configured } from '../lib/supabase'
import { ensureLeadForm, setLeadEnabled } from '../lib/cloud'
import { contactsToCSV, parseCSV, rowsToContacts } from '../lib/crm'

export default function Settings() {
  const st = useStore(), { settings, setSettings, loadSample, erase, clearLocal, importContacts, sync, syncNow } = st
  const { user, logout } = useAuth()
  const [preview, setPreview] = useState(null), [form, setForm] = useState(null), [copied, setCopied] = useState(false), [formErr, setFormErr] = useState('')
  const has = st.contacts.length + st.deals.length + st.tasks.length + st.companies.length > 0
  useEffect(() => { if (user && configured) ensureLeadForm().then(setForm).catch((e) => setFormErr(e.message)); else setForm(null) }, [user?.id])
  const link = form ? `${location.origin}/lead/${form.token}` : ''
  const download = (text, name, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href) }
  const pick = async (e) => { const file = e.target.files[0]; e.target.value = ''; if (!file) return; setPreview(rowsToContacts(parseCSV(await file.text()), { contacts: st.contacts, companies: st.companies })) }
  const row = 'flex flex-wrap items-center justify-between gap-4 py-5 border-b hairline'
  const Sub = ({ t, d }) => <span><b className="block">{t}</b><span className="label">{d}</span></span>
  return (
    <div className="max-w-3xl">
      <h1 className="h text-4xl sm:text-6xl md:text-7xl">Settings<span style={{ color: 'var(--red)' }}>.</span></h1>
      <div className="border-t-4 rule mt-6 sm:mt-8">
        {configured && (user
          ? <div className={row}><Sub t={<span className="break-all">{`Signed in as ${user.email}`}</span>} d={sync === 'ok' ? 'Everything is synced' : sync === 'syncing' ? 'Syncing' : `Sync problem: ${sync}`} /><span className="flex gap-2 sm:gap-3 w-full sm:w-auto"><button onClick={syncNow} className="btn btn-line flex-1 sm:flex-initial">Sync now</button><button onClick={() => { if (sync === 'ok') clearLocal(); logout() }} className="btn btn-line flex-1 sm:flex-initial">Log out</button></span></div>
          : <div className={row}><Sub t="Sync across devices" d="Log in with your email to keep your data on every device" /><Link to="/login" className="btn w-full sm:w-auto text-center justify-center">Log in</Link></div>)}
        <label className={row}><b>Currency</b><select className="in !w-auto" value={settings.currency} onChange={(e) => setSettings({ currency: e.target.value })}>{['ETB', 'USD', 'EUR', 'GBP'].map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className={row}><Sub t="Follow-up reminder" d="Flag contacts you have not been in touch with for" /><select className="in !w-auto" value={settings.staleDays} onChange={(e) => setSettings({ staleDays: +e.target.value })}>{[14, 30, 60, 90].map((d) => <option key={d} value={d}>{d} days</option>)}</select></label>
        <div className={row}><Sub t="Import contacts" d="A CSV file with a header row. Columns: name, email, phone, company, role, tags, notes. Only name is required." /><label className="btn btn-line cursor-pointer w-full sm:w-auto text-center justify-center">Choose a CSV file<input type="file" accept=".csv,text/csv" className="sr-only" onChange={pick} /></label></div>
        <div className={row}><Sub t="Export contacts" d="A spreadsheet file of everyone, with company and tags" /><button onClick={() => download(contactsToCSV(st), 'kept-contacts.csv', 'text/csv')} disabled={!st.contacts.length} className="btn btn-line disabled:opacity-40 w-full sm:w-auto">Download CSV</button></div>
        <div className="py-5 border-b hairline">
          <Sub t="Lead capture form" d="A public link for your website. Anyone who fills it in lands in your contacts, tagged as a lead." />
          {!configured ? <p className="label mt-3">Needs an account. Add your Supabase keys to turn it on.</p> : !user ? <p className="label mt-3"><Link to="/login" className="underline underline-offset-4">Log in</Link> to get your form link.</p> : formErr ? <p role="alert" className="mt-3 font-semibold" style={{ color: 'var(--red)' }}>{formErr}</p> : !form ? <p className="label mt-3">Setting up</p> : (
            <div className="mt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2"><input readOnly className="in flex-1 min-w-0 text-sm" value={link} aria-label="Your form link" onFocus={(e) => e.target.select()} /><button onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }} className="btn btn-line shrink-0">{copied ? 'Copied' : 'Copy link'}</button></div>
              <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="size-5 accent-[var(--red)]" checked={form.enabled} onChange={async (e) => { const enabled = e.target.checked; try { await setLeadEnabled(enabled); setForm({ ...form, enabled }) } catch (x) { setFormErr(x.message) } }} />The form is {form.enabled ? 'on' : 'off'}</label>
              <p className="label text-xs sm:text-sm">To embed it, use an iframe: &lt;iframe src="{link}" width="100%" height="620" style="border:0"&gt;&lt;/iframe&gt;. New leads appear in Contacts the next time Kept syncs.</p>
            </div>)}
        </div>
        <div className={row}><Sub t="Sample data" d="A small made-up business to explore" /><button onClick={() => (!has || confirm('This replaces everything you have now. Continue?')) && loadSample()} className="btn btn-line w-full sm:w-auto">Load sample data</button></div>
        <div className={row}><Sub t="Erase everything" d={user ? 'Removes all contacts, deals and tasks here and in your account' : 'Removes all contacts, deals and tasks from this browser'} /><button onClick={() => confirm('Erase all your data? This cannot be undone.') && erase()} className="btn btn-line w-full sm:w-auto">Erase all</button></div>
      </div>
      {preview && (
        <Modal title="Import contacts" onClose={() => setPreview(null)}>
          {preview.error ? <p role="alert" className="font-semibold" style={{ color: 'var(--red)' }}>{preview.error}</p> : <>
            <p className="text-lg"><b>{preview.contacts.length}</b> {preview.contacts.length === 1 ? 'contact' : 'contacts'} will be added{preview.companies.length ? `, with ${preview.companies.length} new ${preview.companies.length === 1 ? 'company' : 'companies'}` : ''}. {preview.skipped ? `${preview.skipped} will be skipped (no name, or an email you already have).` : ''}</p>
            <ul className="mt-4 text-sm">{preview.contacts.slice(0, 5).map((c) => <li key={c.id} className="py-1.5 border-b hairline">{c.name} <span className="label">{c.email}</span></li>)}{preview.contacts.length > 5 && <li className="py-1.5 label">and {preview.contacts.length - 5} more</li>}</ul>
            <button disabled={!preview.contacts.length} onClick={() => { importContacts(preview); setPreview(null) }} className="btn mt-5 disabled:opacity-40">Import {preview.contacts.length}</button></>}
        </Modal>)}
    </div>
  )
}
