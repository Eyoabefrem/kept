import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// A square that follows the pointer and swells over anything you can click. Only for mouse users.
export default function Cursor() {
  const x = useMotionValue(-80), y = useMotionValue(-80)
  const sx = useSpring(x, { stiffness: 700, damping: 45 }), sy = useSpring(y, { stiffness: 700, damping: 45 })
  const [big, setBig] = useState(false)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest?.('a,button,summary,input,[data-hover]')) }
    window.addEventListener('pointermove', move)
    return () => { window.removeEventListener('pointermove', move); document.documentElement.classList.remove('has-cursor') }
  }, [])
  return <motion.div aria-hidden="true" className="fixed top-0 left-0 z-[100] pointer-events-none" style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%', background: '#fff', mixBlendMode: 'difference' }} animate={{ width: big ? 60 : 14, height: big ? 60 : 14 }} transition={{ duration: 0.2 }} />
}
