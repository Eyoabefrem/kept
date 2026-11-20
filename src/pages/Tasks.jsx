import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useStore } from '../lib/store'
import { dueBucket } from '../lib/crm'

const TABS = [['now', 'Now', ['overdue', 'today']], ['upcoming', 'Upcoming', ['upcoming']], ['someday', 'Someday', ['someday']], ['done', 'Done', ['done']]]

export default function Tasks() {
  const { tasks, contacts, add, update, remove } = useStore()
  const [tab, setTab] = useState('now'), [title, setTitle] = useState(''), [due, setDue] = useState(''), [contactId, setContactId] = useState('')
  const counts = Object.fromEntries(TABS.map(([k, , b]) => [k, tasks.filter((t) => b.includes(dueBucket(t))).length]))
  const list = tasks.filter((t) => TABS.find(([k]) => k === tab)[2].includes(dueBucket(t))).sort((a, b) => (a.due || '9').localeCompare(b.due || '9'))
  const submit = (e) => { e.preventDefault(); if (!title.trim()) return; add('task', { title: title.trim(), due, done: false, contactId: contactId || null, dealId: null }); setTitle(''); setDue(''); setContactId('') }
  return (
    <div>
      <h1 className="h text-6xl sm:text-7xl">Tasks</h1>
      <form onSubmit={submit} className="flex flex-wrap gap-2 mt-8 border-t-4 rule pt-4">
        <input className="in flex-1 min-w-48" placeholder="Add a task" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task title" />
        <input type="date" className="in !w-auto" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <select className="in !w-auto" value={contactId} onChange={(e) => setContactId(e.target.value)} aria-label="Contact"><option value="">No contact</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button className="btn">Add</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-6">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className="px-4 py-1.5 font-semibold border border-[var(--ink)]" style={tab === k ? { background: 'var(--ink)', color: 'var(--paper)' } : {}}>{l} ({counts[k]})</button>)}</div>
      {!list.length ? <p className="mt-8 text-xl" style={{ color: 'var(--muted)' }}>{tab === 'now' ? 'Nothing due. Enjoy it.' : 'Nothing here.'}</p> : (
        <ul className="mt-2">{list.map((t) => {
          const b = dueBucket(t), c = contacts.find((x) => x.id === t.contactId)
          return (
            <li key={t.id} className="flex items-center gap-3 py-3.5 border-b hairline">
              <button onClick={() => update('task', t.id, { done: !t.done })} aria-label={`${t.done ? 'Reopen' : 'Mark done'}: ${t.title}`} aria-pressed={t.done} className="size-5 border border-[var(--ink)] shrink-0 grid place-items-center text-xs font-black" style={t.done ? { background: 'var(--ink)', color: 'var(--paper)' } : {}}>{t.done ? '✓' : ''}</button>
              <span className="flex-1" style={t.done ? { textDecoration: 'line-through', color: 'var(--muted)' } : {}}>{t.title}{c && <> <Link to={`/app/contacts/${c.id}`} className="label underline underline-offset-4">{c.name}</Link></>}</span>
              {t.due && <span className="text-sm font-bold" style={{ color: b === 'overdue' ? 'var(--red)' : 'var(--muted)' }}>{b === 'overdue' ? 'Overdue ' : ''}{t.due}</span>}
              <button onClick={() => remove('task', t.id)} aria-label={`Delete ${t.title}`}><Trash2 size={16} /></button>
            </li>)
        })}</ul>)}
    </div>
  )
}
