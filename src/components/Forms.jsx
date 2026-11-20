import { useState } from 'react'
import { useStore } from '../lib/store'
import { STAGES } from '../lib/crm'

export const Field = ({ label, children }) => <label className="block text-sm font-semibold">{label}<div className="mt-1 font-normal">{children}</div></label>
const Actions = ({ onCancel, onDelete, label = 'Save' }) => (
  <div className="flex flex-wrap items-center gap-3 pt-2">
    <button className="btn">{label}</button><button type="button" onClick={onCancel} className="btn btn-line">Cancel</button>
    {onDelete && <button type="button" onClick={() => confirm('Delete this? This cannot be undone.') && onDelete()} className="ml-auto font-semibold underline underline-offset-4" style={{ color: 'var(--red)' }}>Delete</button>}
  </div>
)

export function ContactForm({ initial = {}, onSave, onCancel, onDelete }) {
  const { companies } = useStore()
  const [f, setF] = useState({ name: '', email: '', phone: '', role: '', companyId: '', notes: '', ...initial, tags: (initial.tags || []).join(', ') })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => { e.preventDefault(); if (!f.name.trim()) return; onSave({ ...f, name: f.name.trim(), companyId: f.companyId || null, tags: f.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) }) }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Name"><input className="in" value={f.name} onChange={set('name')} autoFocus /></Field>
      <div className="grid sm:grid-cols-2 gap-4"><Field label="Email"><input type="email" className="in" value={f.email} onChange={set('email')} /></Field><Field label="Phone"><input className="in" value={f.phone} onChange={set('phone')} /></Field></div>
      <div className="grid sm:grid-cols-2 gap-4"><Field label="Role"><input className="in" value={f.role} onChange={set('role')} /></Field>
        <Field label="Company"><select className="in" value={f.companyId || ''} onChange={set('companyId')}><option value="">None</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
      <Field label="Tags (separate with commas)"><input className="in" value={f.tags} onChange={set('tags')} placeholder="client, lead" /></Field>
      <Field label="Notes"><textarea className="in" rows={3} value={f.notes} onChange={set('notes')} /></Field>
      <Actions onCancel={onCancel} onDelete={onDelete} />
    </form>
  )
}

export function DealForm({ initial = {}, onSave, onCancel, onDelete }) {
  const { companies, contacts, settings } = useStore()
  const [f, setF] = useState({ title: '', value: '', stage: 'lead', contactId: '', companyId: '', expectedClose: '', ...initial })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault(); if (!f.title.trim()) return
    const closed = f.stage === 'won' || f.stage === 'lost'
    onSave({ ...f, title: f.title.trim(), value: Math.max(0, Number(f.value) || 0), contactId: f.contactId || null, companyId: f.companyId || null, updatedAt: Date.now(), closedAt: closed ? f.closedAt || Date.now() : null })
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Deal"><input className="in" value={f.title} onChange={set('title')} autoFocus placeholder="Website for Abay Coffee" /></Field>
      <div className="grid sm:grid-cols-2 gap-4"><Field label={`Value (${settings.currency})`}><input className="in" inputMode="decimal" value={f.value} onChange={set('value')} /></Field>
        <Field label="Stage"><select className="in" value={f.stage} onChange={set('stage')}>{STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field></div>
      <div className="grid sm:grid-cols-2 gap-4"><Field label="Contact"><select className="in" value={f.contactId || ''} onChange={set('contactId')}><option value="">None</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Company"><select className="in" value={f.companyId || ''} onChange={set('companyId')}><option value="">None</option>{companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
      <Field label="Expected close"><input type="date" className="in" value={f.expectedClose || ''} onChange={set('expectedClose')} /></Field>
      <Actions onCancel={onCancel} onDelete={onDelete} />
    </form>
  )
}

export function CompanyForm({ initial = {}, onSave, onCancel, onDelete }) {
  const [f, setF] = useState({ name: '', website: '', notes: '', ...initial })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (f.name.trim()) onSave({ ...f, name: f.name.trim() }) }} className="space-y-4">
      <Field label="Company name"><input className="in" value={f.name} onChange={set('name')} autoFocus /></Field>
      <Field label="Website"><input className="in" value={f.website} onChange={set('website')} /></Field>
      <Field label="Notes"><textarea className="in" rows={3} value={f.notes} onChange={set('notes')} /></Field>
      <Actions onCancel={onCancel} onDelete={onDelete} />
    </form>
  )
}
