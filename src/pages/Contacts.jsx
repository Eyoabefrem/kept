import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { ContactForm } from '../components/Forms'
import { useStore } from '../lib/store'
import { lastTouch, ago, warmth } from '../lib/crm'
import { WarmthBar } from '../components/Warmth'

export default function Contacts() {
  const { contacts, companies, activities, add, settings } = useStore()
  const [q, setQ] = useState(''), [tag, setTag] = useState(''), [modal, setModal] = useState(false)
  const tags = [...new Set(contacts.flatMap((c) => c.tags || []))].sort()
  const co = (id) => companies.find((c) => c.id === id)?.name || ''
  const s = q.trim().toLowerCase()
  const rows = contacts.filter((c) => (!tag || (c.tags || []).includes(tag)) && (!s || [c.name, c.email, c.phone, co(c.companyId)].some((x) => (x || '').toLowerCase().includes(s)))).sort((a, b) => a.name.localeCompare(b.name))
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="h text-4xl sm:text-6xl md:text-7xl">Contacts</h1><button onClick={() => setModal(true)} className="btn"><Plus size={18} />New contact</button></div>
      <div className="flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8 border-t-4 rule pt-4">
        <input className="in w-full sm:max-w-xs" placeholder="Filter by name, email or company" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter contacts" />
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {['', ...tags].map((t) => <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t} className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base font-semibold border border-[var(--ink)]" style={tag === t ? { background: 'var(--ink)', color: 'var(--paper)' } : {}}>{t || 'All'}</button>)}
        </div>
      </div>
      {!rows.length ? <p className="mt-8 sm:mt-10 text-lg sm:text-xl" style={{ color: 'var(--muted)' }}>{contacts.length ? 'No contacts match.' : 'No contacts yet. Add your first, or load sample data from Settings.'}</p> : (
        <ul className="mt-2">{rows.map((c) => (
          <li key={c.id}><Link to={`/app/contacts/${c.id}`} className="grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_2fr_1fr] gap-x-6 gap-y-2 sm:gap-y-1 py-4 border-b hairline hover:bg-[var(--soft)] px-2">
            <span className="min-w-0"><b className="text-base sm:text-lg block truncate">{c.name}</b><span className="label block truncate">{[c.role, co(c.companyId)].filter(Boolean).join(', ')}</span></span>
            <span className="flex flex-wrap gap-1.5 items-center">{(c.tags || []).map((t) => <span key={t} className="text-xs font-bold px-2 py-0.5 border border-[var(--ink)]">{t}</span>)}</span>
            <span className="text-sm break-all sm:break-normal" style={{ color: 'var(--muted)' }}>{c.email && <span className="block truncate">{c.email}</span>}{c.phone && <span className="block">{c.phone}</span>}</span>
            <span className="flex sm:block items-center justify-between sm:text-right gap-2"><WarmthBar w={warmth(lastTouch(c, activities), Date.now(), settings.staleDays)} /><span className="text-xs sm:text-sm label shrink-0">{ago(lastTouch(c, activities))}</span></span>
          </Link></li>))}</ul>)}
      {modal && <Modal title="New contact" onClose={() => setModal(false)}><ContactForm onSave={(d) => { add('contact', d); setModal(false) }} onCancel={() => setModal(false)} /></Modal>}
    </div>
  )
}
