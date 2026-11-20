// The business rules of Kept. Plain functions, no screens. Tested in crm.test.js.
// State: { companies, contacts, deals, activities, tasks }
export const STAGES = [['lead', 'Lead'], ['contacted', 'Contacted'], ['proposal', 'Proposal'], ['negotiation', 'Negotiation'], ['won', 'Won'], ['lost', 'Lost']]
export const OPEN = ['lead', 'contacted', 'proposal', 'negotiation']
export const ACTIVITY_TYPES = [['note', 'Note'], ['call', 'Call'], ['email', 'Email'], ['meeting', 'Meeting']]
export const uid = () => Math.random().toString(36).slice(2, 10)
const DAY = 864e5
export const isoDay = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` } // local yyyy-mm-dd
export const KINDS = { companies: 'company', contacts: 'contact', deals: 'deal', activities: 'activity', tasks: 'task' }
export const emptyState = () => ({ companies: [], contacts: [], deals: [], activities: [], tasks: [], tombstones: [] })

// Moving a deal to Won or Lost stamps when it closed. Moving it back to an open stage clears that.
export const moveDeal = (deals, id, stage, now = Date.now()) =>
  deals.map((d) => (d.id !== id || d.stage === stage ? d : { ...d, stage, updatedAt: now, closedAt: stage === 'won' || stage === 'lost' ? now : null }))

export function pipelineSummary(deals) {
  const by = Object.fromEntries(STAGES.map(([k]) => [k, { count: 0, value: 0 }]))
  for (const d of deals) { by[d.stage].count++; by[d.stage].value += d.value || 0 }
  const open = OPEN.reduce((t, k) => ({ count: t.count + by[k].count, value: t.value + by[k].value }), { count: 0, value: 0 })
  return { by, open }
}
export function winRate(deals) { const w = deals.filter((d) => d.stage === 'won').length, l = deals.filter((d) => d.stage === 'lost').length; return w + l ? Math.round((w / (w + l)) * 100) : null }
export function wonInMonth(deals, now = Date.now()) {
  const n = new Date(now)
  return deals.filter((d) => { const c = d.closedAt && new Date(d.closedAt); return d.stage === 'won' && c && c.getFullYear() === n.getFullYear() && c.getMonth() === n.getMonth() }).reduce((t, d) => t + (d.value || 0), 0)
}
export const dueBucket = (task, today = isoDay()) => task.done ? 'done' : !task.due ? 'someday' : task.due < today ? 'overdue' : task.due === today ? 'today' : 'upcoming'

// The last time you were in touch with a contact: the latest logged activity, or when you added them.
export const lastTouch = (contact, activities) => Math.max(contact.createdAt, ...activities.filter((a) => a.contactId === contact.id).map((a) => a.at))
export const staleContacts = (contacts, activities, days = 30, now = Date.now()) =>
  contacts.map((c) => ({ contact: c, last: lastTouch(c, activities) })).filter((x) => now - x.last >= days * DAY).sort((a, b) => a.last - b.last)

// Quick search across contacts, companies and deals (at most 8 results).
export function search(s, q) {
  const t = q.trim().toLowerCase()
  if (!t) return []
  const has = (...f) => f.some((x) => (x || '').toLowerCase().includes(t))
  return [
    ...s.contacts.filter((c) => has(c.name, c.email, c.phone, ...(c.tags || []))).map((c) => ({ type: 'contact', id: c.id, label: c.name, sub: c.email || c.phone || '' })),
    ...s.companies.filter((c) => has(c.name)).map((c) => ({ type: 'company', id: c.id, label: c.name, sub: 'Company' })),
    ...s.deals.filter((d) => has(d.title)).map((d) => ({ type: 'deal', id: d.id, label: d.title, sub: 'Deal' })),
  ].slice(0, 8)
}

// Deleting something also tidies what pointed at it.
export function removeEntity(s, kind, id) {
  const without = (arr) => arr.filter((x) => x.id !== id)
  if (kind === 'company') return { ...s, companies: without(s.companies), contacts: s.contacts.map((c) => (c.companyId === id ? { ...c, companyId: null } : c)), deals: s.deals.map((d) => (d.companyId === id ? { ...d, companyId: null } : d)) }
  if (kind === 'contact') return { ...s, contacts: without(s.contacts), activities: s.activities.filter((a) => a.contactId !== id), tasks: s.tasks.filter((t) => t.contactId !== id), deals: s.deals.map((d) => (d.contactId === id ? { ...d, contactId: null } : d)) }
  if (kind === 'deal') return { ...s, deals: without(s.deals), tasks: s.tasks.map((t) => (t.dealId === id ? { ...t, dealId: null } : t)), activities: s.activities.map((a) => (a.dealId === id ? { ...a, dealId: null } : a)) }
  if (kind === 'task') return { ...s, tasks: without(s.tasks) }
  if (kind === 'activity') return { ...s, activities: without(s.activities) }
  return s
}

export function contactsToCSV(s) {
  const esc = (v) => { const x = String(v ?? ''); return /[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x }
  const co = Object.fromEntries(s.companies.map((c) => [c.id, c.name]))
  const rows = [['name', 'email', 'phone', 'company', 'role', 'tags', 'notes']]
  for (const c of s.contacts) rows.push([c.name, c.email, c.phone, co[c.companyId] || '', c.role, (c.tags || []).join('; '), c.notes])
  return rows.map((r) => r.map(esc).join(',')).join('\n')
}
export const fmtMoney = (v, cur = 'ETB') => new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(v || 0)
export const ago = (t, now = Date.now()) => { const d = Math.floor((now - t) / DAY); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 30 ? `${d} days ago` : d < 365 ? `${Math.floor(d / 30)} months ago` : `${Math.floor(d / 365)} years ago` }

// ---- Warmth: how recently you were in touch ----
// 1 right after you spoke, fading to 0 at twice your follow-up threshold.
export const warmth = (last, now = Date.now(), staleDays = 30) => Math.max(0, Math.min(1, 1 - (now - last) / DAY / (staleDays * 2)))

// ---- Reports ----
// Won revenue for each of the last `months` months, oldest first.
export function monthlyRevenue(deals, months = 12, now = Date.now()) {
  const n = new Date(now), idx = (d) => d.getFullYear() * 12 + d.getMonth()
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(n.getFullYear(), n.getMonth() - (months - 1 - i), 1)
    const value = deals.filter((x) => x.stage === 'won' && x.closedAt && idx(new Date(x.closedAt)) === idx(d)).reduce((t, x) => t + (x.value || 0), 0)
    return { year: d.getFullYear(), month: d.getMonth(), value }
  })
}
export function avgDaysToClose(deals) {
  const w = deals.filter((d) => d.stage === 'won' && d.closedAt && d.createdAt)
  return w.length ? Math.round(w.reduce((t, d) => t + (d.closedAt - d.createdAt), 0) / w.length / DAY) : null
}
// Best clients by won value. A client is the company if the deal has one, otherwise the contact.
export function topClients(deals, contacts, companies, n = 5) {
  const m = new Map()
  for (const d of deals) if (d.stage === 'won') {
    const name = companies.find((c) => c.id === d.companyId)?.name || contacts.find((c) => c.id === d.contactId)?.name || 'Unknown'
    m.set(name, (m.get(name) || 0) + (d.value || 0))
  }
  return [...m].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, n)
}

// ---- Import ----
// A small CSV reader that handles quotes, commas and line breaks inside quotes.
export function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += ch }
    else if (ch === '"') q = true
    else if (ch === ',') { row.push(cell); cell = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = '' }
    else cell += ch
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}
// Turn CSV rows into new contacts (and any new companies). Skips blank names and emails you already have.
export function rowsToContacts(rows, existing = { contacts: [], companies: [] }, now = Date.now()) {
  const fail = (error) => ({ contacts: [], companies: [], skipped: 0, error })
  if (!rows.length) return fail('The file is empty.')
  const head = rows[0].map((h) => h.trim().toLowerCase()), col = (k) => head.indexOf(k)
  if (col('name') < 0) return fail('The first row needs a "name" column.')
  const emails = new Set(existing.contacts.map((c) => (c.email || '').toLowerCase()).filter(Boolean))
  const companies = [...existing.companies], newCompanies = [], out = []
  let skipped = 0
  for (const r of rows.slice(1)) {
    const get = (k) => (col(k) < 0 ? '' : (r[col(k)] || '').trim())
    const name = get('name'), email = get('email').toLowerCase()
    if (!name || (email && emails.has(email))) { skipped++; continue }
    if (email) emails.add(email)
    let companyId = null
    const cname = get('company')
    if (cname) {
      let c = companies.find((x) => x.name.toLowerCase() === cname.toLowerCase())
      if (!c) { c = { id: uid(), name: cname, website: '', notes: '', createdAt: now, updatedAt: now }; companies.push(c); newCompanies.push(c) }
      companyId = c.id
    }
    out.push({ id: uid(), name, email: get('email'), phone: get('phone'), role: get('role'), companyId, tags: get('tags').split(/[;,]/).map((t) => t.trim().toLowerCase()).filter(Boolean), notes: get('notes'), createdAt: now, updatedAt: now })
  }
  return { contacts: out, companies: newCompanies, skipped, error: null }
}

// ---- Deleting, with a record of what was deleted so other devices can follow ----
export function removeTracked(s, kind, id, now = Date.now()) {
  const next = removeEntity(s, kind, id), tomb = [...(s.tombstones || [])], out = { ...next }
  for (const [arr, k] of Object.entries(KINDS)) {
    const ids = new Set(next[arr].map((r) => r.id))
    for (const r of s[arr]) if (!ids.has(r.id)) tomb.push({ kind: k, id: r.id, at: now })
    out[arr] = next[arr].map((r) => (s[arr].find((x) => x.id === r.id) !== r ? { ...r, updatedAt: now } : r)) // unlinked records count as edited
  }
  return { ...out, tombstones: tomb }
}
export function eraseTracked(s, now = Date.now()) {
  const tomb = [...(s.tombstones || [])]
  for (const [arr, k] of Object.entries(KINDS)) for (const r of s[arr]) tomb.push({ kind: k, id: r.id, at: now })
  return { ...emptyState(), tombstones: tomb }
}
