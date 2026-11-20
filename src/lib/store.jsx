import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { emptyState, moveDeal as move, removeTracked, eraseTracked, uid } from './crm'
import { sampleData } from './sample'
import { flatten, mergeRows, unflatten } from './sync'
import { useAuth } from './auth'
import * as cloud from './cloud'

// Local-first: everything is saved in this browser. When you are logged in it also syncs to your account.
const Ctx = createContext(null)
const KEY = 'kept-v1'
const KINDS = { company: 'companies', contact: 'contacts', deal: 'deals', task: 'tasks', activity: 'activities' }
const DEFAULTS = { currency: 'ETB', staleDays: 30 }

export function StoreProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const [init] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } })
  const [s, setS] = useState({ ...emptyState(), ...init.data })
  const [settings, setSettings] = useState({ ...DEFAULTS, ...init.settings })
  const [sync, setSync] = useState('off') // 'off' | 'syncing' | 'ok' | an error message
  const latest = useRef({ s, settings }); latest.current = { s, settings }
  const pushed = useRef(new Map()) // what the cloud already has: "kind:id" -> updatedAt
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ data: s, settings })) } catch {} }, [s, settings])

  // Download, merge (newest wins), upload what the cloud is missing.
  const pull = useCallback(async () => {
    setSync('syncing')
    const { rows, push } = mergeRows(flatten(latest.current.s, latest.current.settings), await cloud.pullAll())
    const { state, settings: st } = unflatten(rows)
    setS(state); if (st) setSettings({ ...DEFAULTS, ...st })
    await cloud.pushRows(push)
    pushed.current = new Map(rows.map((r) => [`${r.kind}:${r.id}`, r.updatedAt]))
    setSync('ok')
  }, [])
  useEffect(() => {
    if (!userId) { setSync('off'); return }
    const go = () => pull().catch((e) => setSync(e.message))
    go()
    const onVis = () => { if (document.visibilityState === 'visible') go() } // catch up when you come back to the tab
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [userId, pull])
  // Push local changes a moment after you make them.
  useEffect(() => {
    if (!userId || sync !== 'ok') return
    const t = setTimeout(() => {
      const rows = flatten(s, settings).filter((r) => pushed.current.get(`${r.kind}:${r.id}`) !== r.updatedAt)
      if (rows.length) cloud.pushRows(rows).then(() => rows.forEach((r) => pushed.current.set(`${r.kind}:${r.id}`, r.updatedAt))).catch((e) => setSync(e.message))
    }, 900)
    return () => clearTimeout(t)
  }, [s, settings, userId, sync])

  const add = (kind, data) => { const id = uid(), now = Date.now(); setS((x) => ({ ...x, [KINDS[kind]]: [...x[KINDS[kind]], { id, createdAt: now, updatedAt: now, ...data }] })); return id }
  const update = (kind, id, patch) => setS((x) => ({ ...x, [KINDS[kind]]: x[KINDS[kind]].map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r)) }))
  const remove = (kind, id) => setS((x) => removeTracked(x, kind, id))
  const moveDeal = (id, stage) => setS((x) => ({ ...x, deals: move(x.deals, id, stage) }))
  const loadSample = () => setS((x) => ({ ...eraseTracked(x), ...sampleData() }))
  const erase = () => setS((x) => eraseTracked(x))
  const clearLocal = () => { setS(emptyState()); setSettings(DEFAULTS) } // after logging out of a synced account
  const importContacts = ({ contacts, companies }) => setS((x) => ({ ...x, contacts: [...x.contacts, ...contacts], companies: [...x.companies, ...companies] }))
  const setPrefs = (p) => setSettings((x) => ({ ...x, ...p, updatedAt: Date.now() }))
  return <Ctx.Provider value={{ ...s, settings, setSettings: setPrefs, add, update, remove, moveDeal, loadSample, erase, clearLocal, importContacts, sync, syncNow: () => pull().catch((e) => setSync(e.message)) }}>{children}</Ctx.Provider>
}
export const useStore = () => useContext(Ctx)
