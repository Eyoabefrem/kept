import assert from 'node:assert/strict'
import { flatten, mergeRows, unflatten } from './sync.js'
import { emptyState, removeTracked } from './crm.js'

const row = (kind, id, updatedAt, extra = {}) => ({ kind, id, updatedAt, deleted: false, data: { id, updatedAt, ...extra } })
const gone = (kind, id, updatedAt) => ({ kind, id, updatedAt, deleted: true, data: null })
const ids = (m) => m.rows.map((r) => `${r.kind}:${r.id}:${r.deleted ? 'x' : 'ok'}`).sort()

// first sync on a new device, and first login with data already here
let m = mergeRows([], [row('contact', 'a', 5), row('deal', 'b', 6)])
assert.deepEqual(ids(m), ['contact:a:ok', 'deal:b:ok']); assert.deepEqual(m.push, [], 'nothing to upload')
m = mergeRows([row('contact', 'a', 5)], [])
assert.deepEqual(m.push.map((r) => r.id), ['a'], 'local-only records get uploaded')

// the newer edit wins, whichever side it is on
m = mergeRows([row('contact', 'a', 9, { name: 'local' })], [row('contact', 'a', 5, { name: 'cloud' })])
assert.equal(m.rows[0].data.name, 'local'); assert.equal(m.push.length, 1)
m = mergeRows([row('contact', 'a', 5, { name: 'local' })], [row('contact', 'a', 9, { name: 'cloud' })])
assert.equal(m.rows[0].data.name, 'cloud'); assert.equal(m.push.length, 0)
m = mergeRows([row('contact', 'a', 5, { name: 'local' })], [row('contact', 'a', 5, { name: 'cloud' })])
assert.equal(m.rows[0].data.name, 'cloud', 'a tie goes to the cloud'); assert.equal(m.push.length, 0)

// deletes travel
m = mergeRows([row('contact', 'a', 5)], [gone('contact', 'a', 8)])
assert.deepEqual(ids(m), ['contact:a:x'], 'deleted elsewhere later, so deleted here'); assert.equal(m.push.length, 0)
m = mergeRows([gone('contact', 'a', 8)], [row('contact', 'a', 5)])
assert.deepEqual(ids(m), ['contact:a:x']); assert.equal(m.push.length, 1, 'the delete is sent to the cloud')
m = mergeRows([row('contact', 'a', 12)], [gone('contact', 'a', 8)])
assert.deepEqual(ids(m), ['contact:a:ok'], 'edited after the delete, so it comes back')
assert.equal(mergeRows([row('contact', 'a', 5)], [row('company', 'a', 5)]).rows.length, 2, 'the same id in different kinds is different')

// state in and out
const s = { ...emptyState(), contacts: [{ id: 'c1', name: 'Ann', createdAt: 3 }], tasks: [{ id: 't1', createdAt: 4, updatedAt: 7 }], tombstones: [{ kind: 'deal', id: 'd9', at: 6 }] }
const flat = flatten(s, { currency: 'ETB', updatedAt: 2 })
assert.equal(flat.length, 4); assert.equal(flat.find((r) => r.id === 'c1').updatedAt, 3, 'falls back to createdAt'); assert.equal(flat.find((r) => r.id === 't1').updatedAt, 7)
const back = unflatten(flat)
assert.deepEqual(back.state.contacts, s.contacts); assert.deepEqual(back.state.tombstones, s.tombstones); assert.equal(back.settings.currency, 'ETB')
assert.equal(unflatten([]).settings, null)

// the whole story: delete on device A, sync to device B
const A0 = { ...emptyState(), contacts: [{ id: 'p', name: 'P', createdAt: 1, updatedAt: 1 }], tasks: [{ id: 't', contactId: 'p', createdAt: 1, updatedAt: 1 }] }
const A1 = removeTracked(A0, 'contact', 'p', 100)
const cloud = flatten(A1, {})
const B = mergeRows(flatten(A0, {}), cloud)
const resultB = unflatten(B.rows).state
assert.equal(resultB.contacts.length, 0); assert.equal(resultB.tasks.length, 0, 'the contact and its task are gone on device B too')
console.log('Sync tests passed')
