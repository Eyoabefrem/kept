import { useState, useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

// A number that counts up to its value.
export default function CountUp({ value, format = (v) => Math.round(v).toLocaleString() }) {
  const [v, setV] = useState(0)
  const prev = useRef(0)
  useEffect(() => { const c = animate(prev.current, value, { duration: 0.9, ease: [0.2, 0.8, 0.2, 1], onUpdate: setV }); prev.current = value; return () => c.stop() }, [value])
  return <span className="tabular-nums">{format(v)}</span>
}
