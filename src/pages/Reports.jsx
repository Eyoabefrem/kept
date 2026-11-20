import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CountUp from '../components/CountUp'
import { useStore } from '../lib/store'
import { STAGES, monthlyRevenue, winRate, avgDaysToClose, topClients, pipelineSummary, fmtMoney } from '../lib/crm'

export default function Reports() {
  const { deals, contacts, companies, settings } = useStore(), cur = settings.currency
  if (!deals.length) return <div className="border-t-4 rule pt-6 max-w-2xl"><h1 className="h text-6xl sm:text-7xl">Reports<span style={{ color: 'var(--red)' }}>.</span></h1><p className="text-xl mt-6" style={{ color: 'var(--muted)' }}>Reports appear once you have deals. <Link to="/app/deals" className="underline underline-offset-4">Add one</Link>, or load sample data from Settings.</p></div>
  const months = monthlyRevenue(deals, 12), max = Math.max(1, ...months.map((m) => m.value)), best = Math.max(...months.map((m) => m.value))
  const wonDeals = deals.filter((d) => d.stage === 'won'), total = wonDeals.reduce((t, d) => t + (d.value || 0), 0)
  const wr = winRate(deals), days = avgDaysToClose(deals), top = topClients(deals, contacts, companies), sum = pipelineSummary(deals)
  const stats = [[<CountUp value={total} format={(v) => fmtMoney(v, cur)} />, 'Won, all time'], [<CountUp value={wonDeals.length ? total / wonDeals.length : 0} format={(v) => fmtMoney(v, cur)} />, 'Average deal'], [wr === null ? '-' : `${wr}%`, 'Win rate'], [days === null ? '-' : `${days} days`, 'Average time to win']]
  return (
    <div>
      <h1 className="h text-4xl sm:text-6xl md:text-7xl">Reports<span style={{ color: 'var(--red)' }}>.</span></h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t-4 rule mt-6 sm:mt-8">
        {stats.map(([v, l], i) => (
          <div key={l} className={`p-3 sm:p-5 border-b hairline ${i % 2 ? 'border-l hairline' : ''} lg:border-l hairline lg:first:border-l-0 min-w-0`}>
            <b className="h text-xl sm:text-3xl lg:text-4xl block truncate" title={typeof v === 'string' ? v : undefined}>{v}</b>
            <span className="label mt-1 sm:mt-2 block text-xs sm:text-sm truncate">{l}</span>
          </div>
        ))}
      </div>
      <h2 className="h text-2xl sm:text-3xl border-b rule pb-2 mt-8 sm:mt-12">Revenue, last 12 months</h2>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[340px]">
          <div className="flex items-end gap-1.5 sm:gap-3 h-52 sm:h-64 mt-6 border-b rule" role="img" aria-label="Won revenue by month">
            {months.map((m, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end" title={`${new Date(m.year, m.month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}: ${fmtMoney(m.value, cur)}`}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(m.value / max) * 100}%` }} transition={{ delay: i * 0.04, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} style={{ background: m.value && m.value === best ? 'var(--red)' : 'var(--ink)', minHeight: m.value ? 3 : 1 }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 sm:gap-3 mt-2">
            {months.map((m, i) => (
              <span key={i} className="flex-1 label text-center text-[10px] sm:text-xs truncate">
                {new Date(m.year, m.month).toLocaleString(undefined, { month: 'short' })}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-8 sm:gap-y-10 mt-8 sm:mt-12">
        <section><h2 className="h text-2xl sm:text-3xl border-b rule pb-2">Best clients</h2>{!top.length ? <p className="mt-4" style={{ color: 'var(--muted)' }}>Win a deal and your best clients show up here.</p> : <ol className="mt-2">{top.map((c, i) => <li key={c.name} className="flex items-baseline gap-3 sm:gap-4 py-3 border-b hairline"><b className="h text-2xl sm:text-3xl w-7 sm:w-8 shrink-0" style={{ color: i === 0 ? 'var(--red)' : 'var(--ink)' }}>{i + 1}</b><span className="flex-1 font-semibold text-base sm:text-lg min-w-0 truncate">{c.name}</span><b className="tabular-nums shrink-0 text-sm sm:text-base">{fmtMoney(c.value, cur)}</b></li>)}</ol>}</section>
        <section><h2 className="h text-2xl sm:text-3xl border-b rule pb-2">Where deals stand</h2><ul className="mt-2">{STAGES.map(([k, l]) => <li key={k} className="flex justify-between py-3 border-b hairline text-sm sm:text-base"><span className="font-semibold">{l}</span><span className="tabular-nums">{sum.by[k].count} {sum.by[k].count === 1 ? 'deal' : 'deals'}, {fmtMoney(sum.by[k].value, cur)}</span></li>)}</ul></section>
      </div>
    </div>
  )
}
