import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  return (
    <div className="fixed inset-0 z-40 grid place-items-start sm:place-items-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,.55)' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-lg border border-[var(--ink)] bg-[var(--paper)] p-6 my-8">
        <div className="flex items-start justify-between gap-4 mb-5"><h2 className="h text-3xl">{title}</h2><button onClick={onClose} aria-label="Close"><X /></button></div>
        {children}
      </div>
    </div>
  )
}
