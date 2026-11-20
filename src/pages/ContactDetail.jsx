import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Mail, Phone, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { ContactForm, DealForm } from '../components/Forms'
import { useStore } from '../lib/store'
import { ACTIVITY_TYPES, STAGES, fmtMoney, ago, dueBucket } from '../lib/crm'

export default function ContactDetail() {
  const { id } = useParams(), nav = useNavigate()
  const { contacts, companies, deals, tasks, activities, settings, add, update, remove } = useStore()
  const c = contacts.find((x) => x.id === id)
  const [modal, setModal] = useState(null) // 'edit' | 'deal'
  const [type, setType] = useState('note'), [text, setText] = useState('')
  const [title, setTitle] = useState(''), [due, setDue] = useState('')
  if (!c) return <p className="text-xl">That contact doesn’t exist. <Link to="/app/contacts" className="underline underline-offset-4">Back to contacts</Link></p>
  const company = companies.find((x) => x.id === c.companyId)
  const mine = { acts: activities.filter((a) => a.contactId === id).sort((a, b) => b.at - a.at), deals: deals.filter((d) => d.contactId === id), tasks: tasks.filter((t) => t.contactId === id && !t.done) }
  const logActivity = (e) => { e.preventDefault(); if (text.trim()) { add('activity', { type, text: text.trim(), contactId: id, dealId: null, at: Date.now() }); setText('') } }
  const addTask = (e) => { e.preventDefault(); if (title.trim()) { add('task', { title: title.trim(), due, done: false, contactId: id, dealId: null }); setTitle(''); setDue('') } }

  return (
    <div>
      <Link to="/app/contacts" className="label underline underline-offset-4">Contacts</Link>
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-x-12 gap-y-10 mt-3">
        <section className="border-t-4 rule pt-4">
          <h1 className="h text-5xl sm:text-6xl break-words">{c.name}</h1>
          <p className="text-xl mt-3" style={{ color: 'var(--muted)' }}>{[c.role, company?.name].filter(Boolean).join(', ')}</p>
          <div className="mt-5 space-y-2 font-semibold">{c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 underline underline-offset-4"><Mail size={16} />{c.email}</a>}{c.phone && <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 underline underline-offset-4"><Phone size={16} />{c.phone}</a>}</div>
          <div className="flex flex-wrap gap-1.5 mt-4">{(c.tags || []).map((t) => <span key={t} className="text-xs font-bold px-2 py-0.5 border border-[var(--ink)]">{t}</span>)}</div>
          {c.notes && <p className="mt-5 whitespace-pre-wrap">{c.notes}</p>}
          <button onClick={() => setModal('edit')} className="btn btn-line mt-6">Edit contact</button>

          <h2 className="h text-3xl border-b rule pb-2 mt-12">Deals</h2>
          {!mine.deals.length ? <p className="mt-3" style={{ color: 'var(--muted)' }}>No deals yet.</p> : <ul>{mine.deals.map((d) => <li key={d.id} className="py-3 border-b hairline flex justify-between gap-3"><Link to="/app/deals" className="font-semibold underline underline-offset-4">{d.title}</Link><span className="text-sm font-semibold">{STAGES.find(([k]) => k === d.stage)[1]}, {fmtMoney(d.value, settings.currency)}</span></li>)}</ul>}
          <button onClick={() => setModal('deal')} className="font-semibold underline underline-offset-4 mt-3 inline-flex items-center gap-1"><Plus size={16} />Add a deal</button>
        </section>

        <section>
          <h2 className="h text-3xl border-t-4 rule pt-4 pb-2">Timeline</h2>
          <form onSubmit={logActivity} className="border border-[var(--ink)] p-3 flex flex-col gap-3">
            <div className="flex gap-2 flex-wrap">{ACTIVITY_TYPES.map(([k, l]) => <button type="button" key={k} onClick={() => setType(k)} aria-pressed={type === k} className="px-3 py-1 font-semibold border border-[var(--ink)]" style={type === k ? { background: 'var(--ink)', color: 'var(--paper)' } : {}}>{l}</button>)}</div>
            <textarea className="in" rows={2} placeholder="What happened?" value={text} onChange={(e) => setText(e.target.value)} aria-label="Activity note" />
            <button className="btn self-start">Log it</button>
          </form>
          {!mine.acts.length ? <p className="mt-4" style={{ color: 'var(--muted)' }}>Nothing logged yet. Notes, calls, emails and meetings you log appear here.</p> : (
            <ol className="mt-4 border-l-2 border-[var(--ink)] ml-1">{mine.acts.map((a) => <li key={a.id} className="pl-5 pb-6 relative"><span className="sq absolute -left-[7px] top-1.5" /><p className="font-bold capitalize">{a.type} <span className="label font-normal">{ago(a.at)}</span></p><p>{a.text}</p></li>)}</ol>)}

          <h2 className="h text-3xl border-b rule pb-2 mt-8">Tasks</h2>
          <form onSubmit={addTask} className="flex flex-wrap gap-2 mt-3"><input className="in flex-1 min-w-40" placeholder="Follow up on..." value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task" /><input type="date" className="in !w-auto" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" /><button className="btn">Add</button></form>
          <ul>{mine.tasks.map((t) => <li key={t.id} className="flex items-center gap-3 py-3 border-b hairline"><button onClick={() => update('task', t.id, { done: true })} aria-label={`Mark done: ${t.title}`} className="size-5 border border-[var(--ink)] shrink-0 hover:bg-[var(--red)]" /><span className="flex-1">{t.title}</span>{t.due && <span className="text-sm font-bold" style={{ color: dueBucket(t) === 'overdue' ? 'var(--red)' : 'var(--muted)' }}>{t.due}</span>}</li>)}</ul>
        </section>
      </div>
      {modal === 'edit' && <Modal title="Edit contact" onClose={() => setModal(null)}><ContactForm initial={c} onSave={(d) => { update('contact', id, d); setModal(null) }} onCancel={() => setModal(null)} onDelete={() => { remove('contact', id); nav('/app/contacts') }} /></Modal>}
      {modal === 'deal' && <Modal title="New deal" onClose={() => setModal(null)}><DealForm initial={{ contactId: id, companyId: c.companyId || '' }} onSave={(d) => { add('deal', d); setModal(null) }} onCancel={() => setModal(null)} /></Modal>}
    </div>
  )
}
