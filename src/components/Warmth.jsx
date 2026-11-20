import { Link } from 'react-router-dom'
import { warmth, lastTouch } from '../lib/crm'

const color = (w) => `color-mix(in srgb, var(--red) ${Math.round(w * 100)}%, var(--cold))`

// A thin bar: red when you are in touch, gray when it has gone quiet.
export const WarmthBar = ({ w }) => <span aria-hidden="true" className="block h-1.5 w-full max-w-24 sm:ml-auto mb-1" style={{ background: 'var(--soft)' }}><span className="block h-full" style={{ width: `${Math.max(6, w * 100)}%`, background: color(w) }} /></span>

// One square for every person you keep track of.
export function WarmthMap({ contacts, activities, staleDays }) {
  const now = Date.now()
  const items = contacts.map((c) => ({ c, w: warmth(lastTouch(c, activities), now, staleDays) })).sort((a, b) => b.w - a.w)
  const cold = items.filter((x) => x.w < 0.5).length
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mt-4" role="list" aria-label="Warmth of each contact">
        {items.map(({ c, w }) => <Link key={c.id} role="listitem" to={`/app/contacts/${c.id}`} title={`${c.name}: ${w >= 0.5 ? 'warm' : 'going cold'}`} aria-label={`${c.name}, ${w >= 0.5 ? 'warm' : 'going cold'}`} className="size-9 sm:size-10 block transition-transform hover:scale-110" style={{ background: color(w) }} />)}
      </div>
      <p className="label mt-3">{cold === 0 ? 'Everyone is warm.' : `${cold} of ${items.length} ${cold === 1 ? 'person is' : 'people are'} going cold.`} Red means you spoke recently. Gray means it has been a while.</p>
    </div>
  )
}
