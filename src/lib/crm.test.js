import assert from 'node:assert/strict'
import { moveDeal, pipelineSummary, winRate, wonInMonth, dueBucket, lastTouch, staleContacts, search, removeEntity, contactsToCSV, isoDay, ago, emptyState, warmth, monthlyRevenue, avgDaysToClose, topClients, parseCSV, rowsToContacts, removeTracked, eraseTracked } from './crm.js'
import { sampleData } from './sample.js'

const DAY = 864e5, now = new Date(2025, 5, 15, 12).getTime() // 15 June 2025
const deal = (o) => ({ id: 'd', title: 'T', value: 100, stage: 'lead', closedAt: null, ...o })

// moving deals
let ds = moveDeal([deal({}), deal({ id: 'e' })], 'd', 'won', now)
assert.equal(ds[0].stage, 'won'); assert.equal(ds[0].closedAt, now); assert.equal(ds[1].stage, 'lead', 'other deals are untouched')
assert.equal(moveDeal(ds, 'd', 'negotiation', now + 1)[0].closedAt, null, 'reopening clears the close date')
assert.equal(moveDeal(ds, 'd', 'won', now + 5)[0].closedAt, now, 'dropping on the same column changes nothing')
assert.equal(moveDeal(ds, 'd', 'lost', now + 5)[0].closedAt, now + 5)

// pipeline numbers
const p = pipelineSummary([deal({ value: 100 }), deal({ id: 'b', value: 50, stage: 'proposal' }), deal({ id: 'c', value: 999, stage: 'won' }), deal({ id: 'x', value: undefined })])
assert.deepEqual(p.open, { count: 3, value: 150 }, 'won deals are not in the open pipeline'); assert.equal(p.by.won.value, 999)
assert.equal(winRate([]), null); assert.equal(winRate([deal({ stage: 'lead' })]), null)
assert.equal(winRate([deal({ stage: 'won' }), deal({ stage: 'won' }), deal({ stage: 'lost' })]), 67)
const closed = (stage, value, at) => deal({ stage, value, closedAt: at })
assert.equal(wonInMonth([closed('won', 100, now - 2 * DAY), closed('won', 50, now - 40 * DAY), closed('lost', 999, now), closed('won', 7, null)], now), 100, 'only this month, only won')

// tasks and follow-ups
const today = isoDay(now)
assert.equal(today, '2025-06-15')
assert.deepEqual([{ due: '2025-06-14' }, { due: today }, { due: '2025-06-16' }, { due: '' }, { due: today, done: true }].map((t) => dueBucket(t, today)), ['overdue', 'today', 'upcoming', 'someday', 'done'])
const c = { id: 'c1', createdAt: now - 100 * DAY }
assert.equal(lastTouch(c, []), c.createdAt); assert.equal(lastTouch(c, [{ contactId: 'c1', at: now - 5 * DAY }, { contactId: 'zz', at: now }]), now - 5 * DAY)
const cs = [c, { id: 'c2', createdAt: now - 31 * DAY }, { id: 'c3', createdAt: now - 29 * DAY }]
assert.deepEqual(staleContacts(cs, [], 30, now).map((x) => x.contact.id), ['c1', 'c2'], 'oldest first; 30 days counts, 29 does not')
assert.deepEqual(staleContacts(cs, [{ contactId: 'c1', at: now - DAY }], 30, now).map((x) => x.contact.id), ['c2'], 'a recent note ends the stale spell')

// search
const s = { contacts: [{ id: 'a', name: 'Hana Bekele', email: 'h@x.com', tags: ['client'] }], companies: [{ id: 'b', name: 'Hana Foods' }], deals: [{ id: 'c', title: 'Hanging signs' }] }
assert.deepEqual(search(s, 'han').map((r) => r.type), ['contact', 'company', 'deal']); assert.equal(search(s, ' CLIENT ')[0].id, 'a', 'matches tags, ignores case and spaces')
assert.deepEqual(search(s, ''), []); assert.deepEqual(search(s, 'zzz'), [])
assert.equal(search({ contacts: Array.from({ length: 20 }, (_, i) => ({ id: i, name: 'Ann' })), companies: [], deals: [] }, 'ann').length, 8)

// deleting tidies references
const st = { ...emptyState(), companies: [{ id: 'k' }], contacts: [{ id: 'p', companyId: 'k' }], deals: [{ id: 'd1', companyId: 'k', contactId: 'p' }], tasks: [{ id: 't1', contactId: 'p', dealId: 'd1' }, { id: 't2', contactId: null, dealId: 'd1' }], activities: [{ id: 'a1', contactId: 'p', dealId: 'd1' }] }
let r = removeEntity(st, 'contact', 'p')
assert.equal(r.contacts.length, 0); assert.equal(r.activities.length, 0); assert.deepEqual(r.tasks.map((t) => t.id), ['t2']); assert.equal(r.deals[0].contactId, null, 'the deal survives')
r = removeEntity(st, 'company', 'k'); assert.equal(r.contacts[0].companyId, null); assert.equal(r.deals[0].companyId, null)
r = removeEntity(st, 'deal', 'd1'); assert.equal(r.deals.length, 0); assert.equal(r.tasks.every((t) => t.dealId === null), true); assert.equal(r.activities.length, 1, 'the history stays')

// export
const csv = contactsToCSV({ companies: [{ id: 'k', name: 'Acme, Inc' }], contacts: [{ name: 'Ann "A" Lee', email: 'a@x.com', phone: '', companyId: 'k', role: 'CEO', tags: ['x', 'y'], notes: 'line1\nline2' }] }).split('\n')
assert.equal(csv[0], 'name,email,phone,company,role,tags,notes')
assert.equal(csv[1], '"Ann ""A"" Lee",a@x.com,,"Acme, Inc",CEO,x; y,"line1')
assert.equal(ago(now, now), 'today'); assert.equal(ago(now - DAY, now), 'yesterday'); assert.equal(ago(now - 45 * DAY, now), '1 months ago')

// the sample business holds together
const sd = sampleData(now)
const ids = (a) => new Set(a.map((x) => x.id))
assert.ok(sd.contacts.every((x) => !x.companyId || ids(sd.companies).has(x.companyId)))
assert.ok(sd.deals.every((x) => ids(sd.contacts).has(x.contactId) && (!x.companyId || ids(sd.companies).has(x.companyId))))
assert.ok(sd.tasks.every((x) => !x.contactId || ids(sd.contacts).has(x.contactId)) && sd.activities.every((x) => ids(sd.contacts).has(x.contactId)))
assert.ok(sd.deals.filter((x) => x.stage === 'won' || x.stage === 'lost').every((x) => x.closedAt), 'closed sample deals have a close date')
assert.ok(staleContacts(sd.contacts, sd.activities, 30, now).length >= 1, 'the sample has someone worth following up')
// warmth
assert.equal(warmth(now, now, 30), 1); assert.equal(warmth(now - 30 * DAY, now, 30), 0.5); assert.equal(warmth(now - 60 * DAY, now, 30), 0)
assert.equal(warmth(now - 400 * DAY, now, 30), 0, 'never below zero'); assert.equal(warmth(now + DAY, now, 30), 1, 'never above one')

// reports
const won = (v, y, m, d, created) => ({ stage: 'won', value: v, closedAt: new Date(y, m, d).getTime(), createdAt: created })
const rev = monthlyRevenue([won(100, 2025, 4, 10), won(50, 2025, 5, 1), won(25, 2025, 5, 14), { stage: 'lead', value: 999, closedAt: null }, won(7, 2024, 0, 1)], 3, now)
assert.deepEqual(rev.map((x) => x.value), [0, 100, 75], 'April, May, June 2025 and nothing else')
assert.deepEqual(rev.map((x) => x.month), [3, 4, 5])
assert.equal(monthlyRevenue([], 12, now).length, 12)
const t0 = new Date(2025, 5, 1).getTime()
assert.equal(avgDaysToClose([{ stage: 'won', closedAt: t0, createdAt: t0 - 10 * DAY }, { stage: 'won', closedAt: t0, createdAt: t0 - 20 * DAY }, { stage: 'lead' }]), 15)
assert.equal(avgDaysToClose([{ stage: 'lead' }]), null)
assert.deepEqual(topClients([{ stage: 'won', companyId: 'k', value: 100 }, { stage: 'won', contactId: 'p', value: 300 }, { stage: 'won', companyId: 'k', value: 50 }, { stage: 'lost', companyId: 'k', value: 9999 }], [{ id: 'p', name: 'Pat' }], [{ id: 'k', name: 'Acme' }]), [{ name: 'Pat', value: 300 }, { name: 'Acme', value: 150 }])

// importing
assert.deepEqual(parseCSV('a,b\n1,"x,y"\n"he said ""hi""",z\r\n'), [['a', 'b'], ['1', 'x,y'], ['he said "hi"', 'z']])
assert.deepEqual(parseCSV('a\n"line1\nline2"\n\n'), [['a'], ['line1\nline2']], 'quoted line breaks stay; blank lines go')
assert.deepEqual(parseCSV(''), [])
const imp = rowsToContacts(parseCSV('Name,Email,Company,Tags\nAnn,ann@x.com,Acme,client; vip\nBen,BEN@x.com,acme,\n,nobody@x.com,,\nAnn Again,ann@x.com,,\nCy,,Zed,lead'), { contacts: [{ email: 'ben@x.com' }], companies: [] }, 5)
assert.deepEqual(imp.contacts.map((c) => c.name), ['Ann', 'Cy']); assert.equal(imp.skipped, 3, 'blank name, duplicate in file, and already in your contacts')
assert.equal(imp.companies.length, 2); assert.deepEqual(imp.contacts[0].tags, ['client', 'vip']); assert.equal(imp.contacts[0].companyId, imp.companies[0].id)
const reuse = rowsToContacts(parseCSV('name,company\nZoe,ACME'), { contacts: [], companies: [{ id: 'k', name: 'Acme' }] })
assert.equal(reuse.companies.length, 0); assert.equal(reuse.contacts[0].companyId, 'k', 'an existing company is reused, ignoring case')
assert.match(rowsToContacts(parseCSV('email\na@x.com')).error, /name/); assert.match(rowsToContacts([]).error, /empty/)
const sd2 = sampleData(now), again = rowsToContacts(parseCSV(contactsToCSV(sd2)))
assert.deepEqual(again.contacts.map((c) => c.name).sort(), sd2.contacts.map((c) => c.name).sort(), 'what you export, you can import')
assert.equal(again.companies.length, sd2.companies.length)

// tracked deletes
const tr = { ...emptyState(), contacts: [{ id: 'p' }], activities: [{ id: 'a1', contactId: 'p' }], tasks: [{ id: 't1', contactId: 'p' }, { id: 't2', contactId: 'zz' }], deals: [{ id: 'd1', contactId: 'p' }, { id: 'd2', contactId: 'zz', updatedAt: 1 }] }
const after = removeTracked(tr, 'contact', 'p', 777)
assert.deepEqual(after.tombstones.map((t) => `${t.kind}:${t.id}`).sort(), ['activity:a1', 'contact:p', 'task:t1'])
assert.equal(after.deals[0].updatedAt, 777, 'an unlinked deal counts as edited, so it syncs'); assert.equal(after.deals[1].updatedAt, 1, 'unrelated records are untouched')
const wiped = eraseTracked(tr, 9)
assert.equal(wiped.tombstones.length, 6); assert.equal(wiped.contacts.length + wiped.deals.length + wiped.tasks.length, 0)
console.log('All tests passed')
