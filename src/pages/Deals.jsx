import { useState } from 'react'
import { Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { DealForm } from '../components/Forms'
import { useStore } from '../lib/store'
import { STAGES, fmtMoney } from '../lib/crm'

export default function Deals() {
  const { deals, contacts, companies, settings, add, update, remove, moveDeal } = useStore()
  const [drag, setDrag] = useState(null), [over, setOver] = useState(null), [modal, setModal] = useState(null) // 'new' | deal
  const cur = settings.currency
  const who = (d) => [contacts.find((c) => c.id === d.contactId)?.name, companies.find((c) => c.id === d.companyId)?.name].filter(Boolean).join(', ')
  const drop = (k) => { if (drag) moveDeal(drag, k); setDrag(null); setOver(null) }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="h text-6xl sm:text-7xl">Deals</h1><button onClick={() => setModal('new')} className="btn"><Plus size={18} />New deal</button></div>
      <p className="mt-3 label">Drag a card to another column, or use the menu on the card.</p>
      <div className="flex gap-0 overflow-x-auto mt-6 border-t-4 rule pb-4">
        {STAGES.map(([k, label]) => {
          const col = deals.filter((d) => d.stage === k), total = col.reduce((t, d) => t + (d.value || 0), 0)
          return (
            <section key={k} onDragOver={(e) => { e.preventDefault(); setOver(k) }} onDragLeave={() => setOver((o) => (o === k ? null : o))} onDrop={() => drop(k)} aria-label={label}
              className="w-64 shrink-0 border-r hairline px-3 pt-3 min-h-80" style={over === k ? { background: 'var(--soft)', boxShadow: 'inset 0 4px 0 var(--red)' } : {}}>
              <h2 className="font-bold flex justify-between"><span>{label}</span><span className="label">{col.length}</span></h2>
              <p className="label mb-3">{fmtMoney(total, cur)}</p>
              <ul className="space-y-3">
                {col.map((d) => (
                  <li key={d.id} draggable onDragStart={(e) => { setDrag(d.id); e.dataTransfer.effectAllowed = 'move' }} onDragEnd={() => { setDrag(null); setOver(null) }}
                    className="border border-[var(--ink)] bg-[var(--paper)] p-3 cursor-grab active:cursor-grabbing" style={drag === d.id ? { opacity: 0.4 } : {}}>
                    <button onClick={() => setModal(d)} className="font-bold text-left underline-offset-4 hover:underline">{d.title}</button>
                    <p className="h text-2xl mt-1" style={{ letterSpacing: '-.03em' }}>{fmtMoney(d.value, cur)}</p>
                    {who(d) && <p className="label mt-1">{who(d)}</p>}
                    {d.expectedClose && <p className="label">Close {d.expectedClose}</p>}
                    <select aria-label={`Move ${d.title} to a stage`} value={d.stage} onChange={(e) => moveDeal(d.id, e.target.value)} className="in !py-1 !text-sm mt-2">{STAGES.map(([sk, sl]) => <option key={sk} value={sk}>{sl}</option>)}</select>
                  </li>))}
              </ul>
            </section>)
        })}
      </div>
      {modal && <Modal title={modal === 'new' ? 'New deal' : 'Edit deal'} onClose={() => setModal(null)}><DealForm initial={modal === 'new' ? {} : modal} onSave={(d) => { modal === 'new' ? add('deal', d) : update('deal', modal.id, d); setModal(null) }} onCancel={() => setModal(null)} onDelete={modal === 'new' ? null : () => { remove('deal', modal.id); setModal(null) }} /></Modal>}
    </div>
  )
}
