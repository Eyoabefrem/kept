import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Users, Building2, Columns3, CheckSquare, Settings, Search, Sun, Moon, BarChart3 } from 'lucide-react'
import Logo from './Logo'
import { useStore } from '../lib/store'
import { search, dueBucket } from '../lib/crm'

const NAV = [['/app', 'Dashboard', LayoutGrid], ['/app/contacts', 'Contacts', Users], ['/app/companies', 'Companies', Building2], ['/app/deals', 'Deals', Columns3], ['/app/tasks', 'Tasks', CheckSquare], ['/app/reports', 'Reports', BarChart3], ['/app/settings', 'Settings', Settings]]
const TITLES = { '/app': 'Dashboard', '/app/contacts': 'Contacts', '/app/companies': 'Companies', '/app/deals': 'Deals', '/app/tasks': 'Tasks', '/app/reports': 'Reports', '/app/settings': 'Settings' }
const link = ({ isActive }) => `flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 font-semibold shrink-0 border-b-2 md:border-b-0 md:border-l-4 ${isActive ? 'border-[var(--red)] bg-[var(--soft)]' : 'border-transparent hover:bg-[var(--soft)]'}`

export default function AppShell() {
  const st = useStore(), nav = useNavigate(), { pathname } = useLocation()
  const [q, setQ] = useState('')
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const results = search(st, q)
  const due = st.tasks.filter((t) => ['overdue', 'today'].includes(dueBucket(t))).length
  useEffect(() => { document.title = `${TITLES[pathname] || (pathname.startsWith('/app/contacts/') ? 'Contact' : 'Kept')} | Kept` }, [pathname])
  const toggle = () => { const n = !dark; document.documentElement.classList.toggle('dark', n); try { localStorage.setItem('theme', n ? 'dark' : 'light') } catch {} setDark(n) }
  const open = (r) => { setQ(''); nav(r.type === 'contact' ? `/app/contacts/${r.id}` : r.type === 'company' ? '/app/companies' : '/app/deals') }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b md:border-b-0 md:border-r hairline sticky top-0 z-20 md:static bg-[var(--paper)] md:bg-transparent md:h-screen flex md:flex-col">
        <Link to="/" className="p-5 hidden md:block border-b hairline"><Logo /></Link>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible md:py-3 flex-1 scrollbar-none" aria-label="Main">
          <Link to="/" className="md:hidden px-3.5 py-2.5 shrink-0 flex items-center border-r hairline"><Logo size={20} /></Link>
          {NAV.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/app'} className={link}><Icon size={17} /><span className="whitespace-nowrap text-sm sm:text-base">{label}</span>{label === 'Tasks' && due > 0 && <span className="ml-auto text-xs font-bold px-1.5 py-0.5 text-white" style={{ background: 'var(--red)' }}>{due}</span>}</NavLink>)}
        </nav>
        <button onClick={toggle} aria-label="Switch theme" className="hidden md:flex items-center gap-3 p-5 border-t hairline font-semibold">{dark ? <Sun size={18} /> : <Moon size={18} />}{dark ? 'Light' : 'Dark'}</button>
      </aside>
      <div className="min-w-0">
        <div className="border-b hairline px-4 sm:px-8 py-3 relative bg-[var(--paper)]">
          <div className="flex items-center gap-2 sm:gap-3 max-w-xl">
            <Search size={18} aria-hidden="true" className="shrink-0" />
            <input className="in !border-0 !p-1 !shadow-none min-w-0 text-sm sm:text-base" placeholder="Search contacts, deals, companies..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            <button onClick={toggle} aria-label="Switch theme" className="md:hidden shrink-0 p-1">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
          {q && <ul className="absolute left-3 right-3 sm:right-auto sm:left-8 top-full z-30 sm:w-[min(32rem,90vw)] border border-[var(--ink)] bg-[var(--paper)] shadow-lg max-h-[70vh] overflow-y-auto">{results.length ? results.map((r) => <li key={r.type + r.id}><button onClick={() => open(r)} className="w-full text-left px-4 py-2.5 hover:bg-[var(--soft)] flex justify-between gap-4"><b>{r.label}</b><span className="label shrink-0">{r.type}{r.sub && r.type === 'contact' ? `, ${r.sub}` : ''}</span></button></li>) : <li className="px-4 py-3 label">Nothing found</li>}</ul>}
        </div>
        <main className="px-4 sm:px-8 py-6 sm:py-8 max-w-6xl"><motion.div key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}><Outlet /></motion.div></main>
      </div>
    </div>
  )
}
