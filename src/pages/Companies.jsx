import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Modal from '../components/Modal'
import { CompanyForm } from '../components/Forms'
import { useStore } from '../lib/store'
import { fmtMoney } from '../lib/crm'

export default function Companies() {
  const { companies, contacts, deals, settings, add, update, remove } = useStore()
  const [modal, setModal] = useState(null) // 'new' | company
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="h text-6xl sm:text-7xl">Companies</h1><button onClick={() => setModal('new')} className="btn"><Plus size={18} />New company</button></div>
      {!companies.length ? <p className="mt-10 text-xl" style={{ color: 'var(--muted)' }}>No companies yet. Add one, then link contacts and deals to it.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t-4 rule mt-8">
          {companies.map((c) => {
            const people = contacts.filter((x) => x.companyId === c.id), ds = deals.filter((x) => x.companyId === c.id)
            return (
              <article key={c.id} className="p-5 border-b border-r hairline">
                <span className="sq" /><h2 className="h text-3xl mt-2 break-words">{c.name}</h2>
                {c.website && <p className="label mt-1">{c.website}</p>}
                <p className="font-semibold mt-4">{people.length} {people.length === 1 ? 'contact' : 'contacts'}, {ds.length} {ds.length === 1 ? 'deal' : 'deals'}</p>
                <p className="label">{fmtMoney(ds.reduce((t, d) => t + (d.value || 0), 0), settings.currency)} in deals</p>
                <ul className="mt-3 text-sm">{people.map((p) => <li key={p.id}><Link to={`/app/contacts/${p.id}`} className="underline underline-offset-4">{p.name}</Link></li>)}</ul>
                <button onClick={() => setModal(c)} className="font-semibold underline underline-offset-4 mt-4">Edit</button>
              </article>)
          })}
        </div>)}
      {modal && <Modal title={modal === 'new' ? 'New company' : 'Edit company'} onClose={() => setModal(null)}><CompanyForm initial={modal === 'new' ? {} : modal} onSave={(d) => { modal === 'new' ? add('company', d) : update('company', modal.id, d); setModal(null) }} onCancel={() => setModal(null)} onDelete={modal === 'new' ? null : () => { remove('company', modal.id); setModal(null) }} /></Modal>}
    </div>
  )
}
