// Merging this device's data with the cloud's. Plain functions, tested in sync.test.js.
// Every record has an updatedAt. When both sides have the same record, the newer one wins (a tie goes to the cloud).
// A delete is a "tombstone" row, so a record deleted on one device does not come back from another.
import { KINDS, emptyState } from './crm.js'

export const flatten = (s, settings) => [
  ...Object.entries(KINDS).flatMap(([arr, kind]) => s[arr].map((r) => ({ kind, id: r.id, updatedAt: r.updatedAt || r.createdAt || 0, deleted: false, data: r }))),
  ...(s.tombstones || []).map((t) => ({ kind: t.kind, id: t.id, updatedAt: t.at, deleted: true, data: null })),
  { kind: 'settings', id: 'main', updatedAt: settings.updatedAt || 0, deleted: false, data: settings },
]
const key = (r) => `${r.kind}:${r.id}`
export function mergeRows(local, cloud) {
  const cl = new Map(cloud.map((r) => [key(r), r])), lo = new Map(local.map((r) => [key(r), r]))
  const rows = [], push = []
  for (const k of new Set([...cl.keys(), ...lo.keys()])) {
    const a = lo.get(k), b = cl.get(k)
    if (!a) rows.push(b)
    else if (!b) { rows.push(a); push.push(a) }
    else if (a.updatedAt > b.updatedAt) { rows.push(a); push.push(a) }
    else rows.push(b)
  }
  return { rows, push } // rows: the agreed truth. push: what the cloud still needs to hear
}
export function unflatten(rows) {
  const state = emptyState()
  let settings = null
  for (const r of rows) {
    if (r.kind === 'settings') { settings = r.data; continue }
    if (r.deleted) { state.tombstones.push({ kind: r.kind, id: r.id, at: r.updatedAt }); continue }
    const arr = Object.keys(KINDS).find((a) => KINDS[a] === r.kind)
    if (arr) state[arr].push(r.data)
  }
  return { state, settings }
}
