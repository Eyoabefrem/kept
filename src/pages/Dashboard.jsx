import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import CountUp from '../components/CountUp'
import { WarmthMap } from '../components/Warmth'
import { STAGES, pipelineSummary, winRate, wonInMonth, dueBucket, staleContacts, fmtMoney, ago, isoDay } from '../lib/crm'

export default function Dashboard() {
  const { deals, tasks, contacts, activities, settings, update, loadSample } = useStore()
  if (!contacts.length && !deals.length && !tasks.length) return (
    <div className="border-t-4 rule pt-6 max-w-2xl"><h1 className="h text-6xl sm:text-7xl">Nothing here yet<span style={{ color: 'var(--red)' }}>.</span></h1>
      <p className="text-xl mt-6" style={{ color: 'var(--muted)' }}>Add your first contact, or load a small sample business to see how Kept looks with real data.</p>
      <div className="flex flex-wrap gap-3 mt-8"><Link to="/app/contacts" className="btn">Add a contact</Link><button onClick={loadSample} className="btn btn-line">Load sample data</button></div></div>
  )
  const cur = settings.currency, sum = pipelineSummary(deals), today = isoDay()
  const due = tasks.filter((t) => ['overdue', 'today'].includes(dueBucket(t, today))).sort((a, b) => a.due.localeCompare(b.due))
  const stale = staleContacts(contacts, activities, settings.staleDays).slice(0, 5)
  const recent = [...activities].sort((a, b) => b.at - a.at).slice(0, 6)
  const name = (id) => contacts.find((c) => c.id === id)?.name
  const max = Math.max(1, ...STAGES.map(([k]) => sum.by[k].value))
  const wr = winRate(deals)
  const stats = [[<CountUp value={sum.open.value} format={(v) => fmtMoney(v, cur)} />, 'Open pipeline'], [<CountUp value={sum.open.count} />, 'Open deals'], [<CountUp value={wonInMonth(deals)} format={(v) => fmtMoney(v, cur)} />, 'Won this month'], [wr === null ? '-' : `${wr}%`, 'Win rate']]

  return (
    <div>
      <h1 className="h text-6xl sm:text-7xl">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t-4 rule mt-8">
        {stats.map(([v, l], i) => <div key={l} className={`p-4 sm:p-5 border-b hairline ${i % 2 ? 'border-l hairline' : ''} lg:border-l lg:first:border-l-0 hairline`}>{i === 0 && <span className="sq mb-3 block" />}<b className="h text-3xl sm:text-5xl block">{v}</b><span className="label mt-2 block">{l}</span></div>)}
      </div>
      <section className="mt-10"><h2 className="h text-3xl border-b rule pb-2">Warmth map</h2><WarmthMap contacts={contacts} activities={activities} staleDays={settings.staleDays} /></section>
      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10 mt-10">
        <section><h2 className="h text-3xl border-b rule pb-2">Pipeline</h2>
          <ul className="mt-4 space-y-3">{STAGES.map(([k, l]) => <li key={k} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3"><span className="font-semibold">{l}</span><span className="h-5 bg-[var(--soft)]"><span className="block h-full" style={{ width: `${(sum.by[k].value / max) * 100}%`, background: k === 'won' ? 'var(--ink)' : k === 'lost' ? 'var(--muted)' : 'var(--red)' }} /></span><span className="text-sm font-semibold tabular-nums">{sum.by[k].count} / {fmtMoney(sum.by[k].value, cur)}</span></li>)}</ul></section>
        <section><h2 className="h text-3xl border-b rule pb-2">Due now</h2>
          {!due.length ? <p className="mt-4" style={{ color: 'var(--muted)' }}>Nothing due. Nice.</p> : <ul className="mt-2">{due.map((t) => <li key={t.id} className="flex items-center gap-3 py-3 border-b hairline"><button onClick={() => update('task', t.id, { done: true })} aria-label={`Mark done: ${t.title}`} className="size-5 border border-[var(--ink)] shrink-0 hover:bg-[var(--red)]" /><span className="flex-1">{t.title}{t.contactId && <span className="label"> {name(t.contactId)}</span>}</span><span className="text-sm font-bold" style={{ color: t.due < today ? 'var(--red)' : 'var(--ink)' }}>{t.due < today ? 'Overdue' : 'Today'}</span></li>)}</ul>}</section>
        <section><h2 className="h text-3xl border-b rule pb-2">Time to follow up</h2>
          {!stale.length ? <p className="mt-4" style={{ color: 'var(--muted)' }}>You are in touch with everyone.</p> : <ul className="mt-2">{stale.map(({ contact, last }) => <li key={contact.id} className="py-3 border-b hairline flex justify-between gap-3"><Link to={`/app/contacts/${contact.id}`} className="font-semibold underline underline-offset-4">{contact.name}</Link><span className="label">last in touch {ago(last)}</span></li>)}</ul>}</section>
        <section><h2 className="h text-3xl border-b rule pb-2">Recent activity</h2>
          {!recent.length ? <p className="mt-4" style={{ color: 'var(--muted)' }}>Log a call or note on a contact and it shows up here.</p> : <ul className="mt-2">{recent.map((a) => <li key={a.id} className="py-3 border-b hairline"><p><b className="capitalize">{a.type}</b> with <Link to={`/app/contacts/${a.contactId}`} className="underline underline-offset-4">{name(a.contactId)}</Link> <span className="label">{ago(a.at)}</span></p><p style={{ color: 'var(--muted)' }}>{a.text}</p></li>)}</ul>}</section>
      </div>
    </div>
  )
}
