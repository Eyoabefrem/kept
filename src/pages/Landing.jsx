import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import Logo from '../components/Logo'
import Cursor from '../components/Cursor'
import { PRICING } from '../lib/pricing'

const EASE = [0.2, 0.8, 0.2, 1]
const NAMES = ['Hana Bekele', 'Dawit Alemu', 'Marta Tesfaye', 'Samuel Girma', 'Liya Mekonnen', 'Daniel Kassa', 'Selam Tadesse', 'Biruk Haile', 'Meron Abebe', 'Yonas Wolde', 'Tigist Mulu', 'Abel Desta', 'Rahel Fikru', 'Nahom Berhe', 'Saron Getachew', 'Kidus Assefa', 'Eden Mengistu', 'Fitsum Lemma', 'Helen Negash', 'Robel Teka', 'Bethel Asfaw', 'Mulugeta Zewdu', 'Ruth Amare', 'Henok Bayou', 'Aster Worku', 'Michael Tilahun', 'Sara Gebre', 'Elias Kebede']
const color = (w) => `color-mix(in srgb, var(--red) ${Math.round(w * 100)}%, var(--cold))`

function Preloader({ done }) {
  const [n, setN] = useState(0)
  useEffect(() => { const t = setInterval(() => setN((v) => { if (v >= 100) { clearInterval(t); setTimeout(done, 200); return 100 } return Math.min(100, v + 5) }), 40); return () => clearInterval(t) }, [])
  return (
    <motion.div className="fixed inset-0 z-[90] flex flex-col justify-between p-6" style={{ background: 'var(--red)', color: '#fff' }} exit={{ y: '-100%' }} transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }} role="status" aria-label="Loading">
      <span className="h text-3xl">kept</span>
      <b className="h text-[clamp(9rem,36vw,30rem)] leading-none tabular-nums">{n}</b>
    </motion.div>
  )
}
const Line = ({ children, i, go }) => <span className="block overflow-hidden pb-[.08em]"><motion.span className="block" initial={{ y: '108%' }} animate={go ? { y: 0 } : {}} transition={{ delay: i * 0.12, duration: 0.9, ease: EASE }}>{children}</motion.span></span>

// The idea of the whole product: people go cold. Let them, then click one.
function Names({ go }) {
  const still = useReducedMotion()
  const [warm, setWarm] = useState(() => NAMES.map(() => 1))
  const rates = useRef(NAMES.map((_, i) => 0.012 + ((i * 7) % 10) * 0.002)).current
  useEffect(() => { if (!go || still) return; const t = setInterval(() => setWarm((w) => w.map((v, i) => Math.max(0, v - rates[i]))), 200); return () => clearInterval(t) }, [go, still])
  const alive = warm.filter((v) => v > 0.35).length
  return (
    <div>
      <p className="h text-[clamp(1.9rem,4.6vw,4.2rem)]" style={{ lineHeight: 1.08, letterSpacing: '-.035em' }}>
        {NAMES.map((n, i) => <span key={n}><button className="name" onClick={() => setWarm((w) => w.map((v, j) => (j === i ? 1 : v)))} style={{ color: color(warm[i]) }} aria-label={`${n}, ${warm[i] > 0.35 ? 'warm' : 'gone cold'}. Press to keep warm.`}>{n}</button><span style={{ color: 'var(--cold)' }}> / </span></span>)}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 border-t-4 rule pt-4">
        <b className="h text-3xl sm:text-5xl tabular-nums" role="status">{alive}<span className="text-xl sm:text-2xl" style={{ color: 'var(--muted)' }}> of {NAMES.length} still warm</span></b>
        <p className="font-semibold text-sm sm:text-base">{alive === 0 ? 'That is how it feels to lose a client.' : 'Click a name to keep it warm.'}</p>
        <button onClick={() => setWarm(NAMES.map(() => 1))} className="font-semibold underline underline-offset-4 ml-auto text-sm sm:text-base">Warm everyone up</button>
      </div>
    </div>
  )
}

const SCENES = [
  { t: '08:30', h: 'The day starts with what you owe.', d: 'Overdue tasks wait on your dashboard, in red, before you open your inbox.' },
  { t: '11:00', h: 'You hang up. You log it.', d: 'A note, a call, a meeting: one line on their timeline. Next month you will thank yourself.' },
  { t: '14:15', h: 'You win one. Drag it.', d: 'Move the deal to Won. The close date and your monthly total sort themselves out.' },
  { t: '17:45', h: 'Then Kept taps your shoulder.', d: 'Hana has not heard from you in 31 days. One click to say hello.' },
]
const Card = ({ children }) => <div className="border border-[var(--ink)] bg-[var(--paper)] p-4 sm:p-5 mr-3 mb-3" style={{ boxShadow: '8px 8px 0 var(--red)' }}>{children}</div>
const UI = [
  () => <Card><p className="label text-xs sm:text-sm">Tasks</p><div className="flex items-center gap-2 sm:gap-3 mt-3"><span className="size-5 sm:size-6 border border-[var(--ink)] grid place-items-center text-white shrink-0" style={{ background: 'var(--ink)' }}><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: 'spring' }}>✓</motion.span></span><b className="text-base sm:text-xl flex-1 min-w-0 truncate">Send brand identity proposal</b><span className="font-bold text-xs sm:text-sm shrink-0" style={{ color: 'var(--red)' }}>Overdue</span></div></Card>,
  () => <Card><p className="label text-xs sm:text-sm">Marta Tesfaye, timeline</p><p className="mt-2 sm:mt-3 text-sm sm:text-base"><b>Call</b> <span className="label">today</span></p><motion.p className="text-base sm:text-lg mt-1" initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ delay: 0.3, duration: 1.4, ease: 'linear' }}>Talked through scope. She wants three logo directions.</motion.p></Card>,
  () => <Card><div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm font-bold"><span>Proposal</span><span>Negotiation</span><span>Won</span></div><div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 h-20 sm:h-24"><span /><motion.p className="border border-[var(--ink)] p-2 font-bold text-xs sm:text-sm h-fit" initial={{ x: 0, background: 'var(--paper)', color: 'var(--ink)' }} animate={{ x: 'calc(100% + 8px)', background: 'var(--ink)', color: 'var(--paper)' }} transition={{ delay: 0.5, duration: 0.9, ease: EASE }}>Annual print contract</motion.p><span /></div></Card>,
  () => <Card><div className="flex items-center justify-between"><b className="text-lg sm:text-xl">Hana Bekele</b><span className="font-bold text-xs sm:text-sm">31 days</span></div><div className="h-2 mt-3" style={{ background: 'var(--soft)' }}><motion.div className="h-full" initial={{ width: '100%', background: 'var(--red)' }} animate={{ width: '12%', background: 'var(--cold)' }} transition={{ duration: 1.6 }} /></div><button className="btn mt-4 sm:mt-5 text-sm sm:text-base !py-1.5 sm:!py-2" tabIndex={-1}>Say hello</button></Card>,
]
function Story() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(SCENES.length - 1, Math.max(0, Math.floor(v * SCENES.length)))))
  const S = SCENES[i], View = UI[i]
  return (
    <section ref={ref} className="relative border-t-4 rule" style={{ height: `${SCENES.length * 85}vh` }} aria-label="A Tuesday with Kept">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-5 grid md:grid-cols-2 gap-6 md:gap-10 items-center py-6 sm:py-10">
          <div>
            <p className="font-semibold flex items-center gap-2 text-sm sm:text-base"><span className="sq" />A Tuesday with Kept</p>
            <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: EASE }}>
              <b className="h block text-[clamp(4rem,14vw,14rem)] tabular-nums" style={{ color: 'var(--red)' }}>{S.t}</b>
              <h2 className="h text-2xl sm:text-5xl mt-2">{S.h}</h2><p className="mt-2 sm:mt-4 text-base sm:text-xl max-w-md" style={{ color: 'var(--muted)' }}>{S.d}</p>
            </motion.div></AnimatePresence>
            <div className="flex gap-2 mt-4 sm:mt-8" aria-hidden="true">{SCENES.map((_, k) => <span key={k} className="h-1.5 w-8 sm:w-12 transition-colors" style={{ background: k <= i ? 'var(--red)' : 'var(--hair)' }} />)}</div>
          </div>
          <div className="relative min-h-48 sm:min-h-60 mt-2 md:mt-0"><AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: EASE }}><View /></motion.div></AnimatePresence></div>
        </div>
      </div>
    </section>
  )
}

const MANIFESTO = 'Solo does not mean alone with a spreadsheet. You are the sales team, the support desk and the one who remembers every birthday. Kept is the memory you do not have to keep.'
const Word = ({ w, i, n, p }) => <motion.span style={{ opacity: useTransform(p, [i / n, Math.min(1, (i + 1.6) / n)], [0.12, 1]) }} className="inline-block mr-[.25em]">{w}</motion.span>
function Manifesto() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = MANIFESTO.split(' ')
  return <p ref={ref} className="h text-[clamp(2.3rem,6.4vw,5.6rem)]" style={{ lineHeight: 1.04 }}>{words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} />)}</p>
}

const INDEX = [['Contacts', 'Everyone you know, with a timeline of everything you said.'], ['Deals', 'A board from lead to won, with the money added up.'], ['Tasks', 'Due today and overdue, waiting where you will see them.'], ['Warmth', 'Who is going cold, before they are gone.'], ['Reports', 'Revenue by month, best clients, how long deals really take.'], ['Lead form', 'A link for your website that files new inquiries as contacts.'], ['Import and export', 'Bring a spreadsheet in. Take one out.']]
const QA = [['Do I need an account?', 'No. Kept works in your browser straight away. Make an account later if you want your data on every device.'], ['Is it only for one person?', 'It is built for one person first. Teams come after.'], ['Can I leave?', 'Whenever you like. Export every contact to a spreadsheet from Settings.'], ['What does it cost?', 'The slider above is the honest answer for this demo.']]

function Price() {
  const [n, setN] = useState(60)
  const plan = n <= 25 ? PRICING[0] : n <= 1000 ? PRICING[1] : PRICING[2]
  return (
    <div className="grid md:grid-cols-12 gap-8 mt-12 border-t-4 rule pt-6">
      <div className="md:col-span-5">
        <label className="text-2xl font-bold" style={{ letterSpacing: '-.02em' }} htmlFor="people">How many people do you keep track of?</label>
        <p className="h text-[clamp(3.5rem,11vw,9rem)] mt-2 sm:mt-4 tabular-nums">{n.toLocaleString()}</p>
        <input id="people" type="range" min="5" max="2000" step="5" value={n} onChange={(e) => setN(+e.target.value)} className="w-full accent-[var(--red)] mt-4" />
      </div>
      <div className="md:col-span-7 md:pl-10 md:border-l hairline">
        <AnimatePresence mode="wait"><motion.div key={plan.name} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
          <p className="font-bold text-xl">{plan.name}, <span style={{ color: 'var(--muted)' }}>{plan.note}</span></p>
          <p className="mt-2"><b className="h text-[clamp(4.5rem,16vw,15rem)]">${plan.price}</b><span className="label"> a month</span></p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 font-medium">{plan.features.map((f) => <li key={f} className="flex gap-2"><span className="sq mt-2" />{f}</li>)}</ul>
          <Link to="/app" className="btn mt-8 text-lg !px-7 !py-3.5">{plan.price === '0' ? 'Start free' : 'Try ' + plan.name}</Link>
        </motion.div></AnimatePresence>
      </div>
    </div>
  )
}

export default function Landing() {
  const [intro, setIntro] = useState(() => { try { return !sessionStorage.getItem('kept-intro') } catch { return false } })
  const finish = () => { try { sessionStorage.setItem('kept-intro', '1') } catch {} setIntro(false) }
  return (
    <div className="overflow-x-hidden">
      <Cursor />
      <AnimatePresence>{intro && <Preloader done={finish} />}</AnimatePresence>
      <header className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between"><Logo /><nav className="flex items-center gap-6 font-semibold"><a href="#story" className="hidden sm:block hover:underline underline-offset-4">The day</a><a href="#inside" className="hidden sm:block hover:underline underline-offset-4">Inside</a><a href="#price" className="hidden sm:block hover:underline underline-offset-4">Price</a><Link to="/app" className="btn !py-2">Open Kept</Link></nav></header>

      <section className="max-w-7xl mx-auto px-5 pt-12 pb-24">
        <p className="font-semibold flex items-center gap-2 text-sm sm:text-base"><span className="sq" />Kept, a CRM for people who are the whole company</p>
        <h1 className="h text-[clamp(2.9rem,13vw,13rem)] mt-6"><Line i={0} go={!intro}>Don’t let</Line><Line i={1} go={!intro}>them go cold<span style={{ color: 'var(--red)' }}>.</span></Line></h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={!intro ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.8 }} className="mt-8 sm:mt-10 max-w-xl text-lg sm:text-2xl font-medium" style={{ letterSpacing: '-.02em' }}>Every client you promised to circle back to. Kept remembers who they are, what you said, and when you last spoke.</motion.p>
        <div className="mt-12 sm:mt-16"><Names go={!intro} /></div>
      </section>

      <div id="story" className="scroll-mt-0"><Story /></div>

      <section className="border-t-4 rule" style={{ background: 'var(--ink)', color: 'var(--paper)' }}><div className="max-w-7xl mx-auto px-5 py-28 sm:py-40"><Manifesto /></div></section>

      <section id="inside" className="max-w-7xl mx-auto px-5 py-24 scroll-mt-4">
        <h2 className="h text-[clamp(2.6rem,8vw,6.5rem)]">What is inside<span style={{ color: 'var(--red)' }}>.</span></h2>
        <ul className="mt-12 border-t-4 rule">{INDEX.map(([t, d]) => (
          <motion.li key={t} data-hover initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5 }} className="group grid md:grid-cols-12 gap-2 md:gap-8 items-baseline px-3 py-5 border-b hairline transition-colors duration-200 hover:bg-[var(--red)] hover:text-white">
            <b className="h md:col-span-7 text-[clamp(2.4rem,7vw,5.6rem)] transition-transform duration-300 group-hover:translate-x-3">{t}</b><span className="md:col-span-5 text-lg font-medium">{d}</span>
          </motion.li>))}</ul>
      </section>

      <section id="price" className="max-w-7xl mx-auto px-5 pb-24 scroll-mt-4">
        <h2 className="h text-[clamp(2.6rem,8vw,6.5rem)]">What it costs<span style={{ color: 'var(--red)' }}>.</span></h2>
        <Price />
        <p className="label mt-6">Illustrative pricing for this demo.</p>
      </section>

      <section className="max-w-7xl mx-auto px-5 pb-28 grid md:grid-cols-12 gap-10">
        <h2 className="h text-[clamp(2.6rem,7vw,5rem)] md:col-span-5">Fair questions<span style={{ color: 'var(--red)' }}>.</span></h2>
        <div className="md:col-span-7 border-t-4 rule">{QA.map(([q, a]) => <details key={q} className="border-b hairline py-5 group"><summary className="h text-2xl sm:text-3xl cursor-pointer list-none flex justify-between gap-4" style={{ letterSpacing: '-.03em', lineHeight: 1.05 }}>{q}<span className="transition-transform group-open:rotate-45" style={{ color: 'var(--red)' }}>+</span></summary><p className="mt-3 text-xl max-w-xl" style={{ color: 'var(--muted)' }}>{a}</p></details>)}</div>
      </section>

      <section style={{ background: 'var(--red)', color: '#fff' }}><div className="max-w-7xl mx-auto px-5 py-20 sm:py-32">
        <h2 className="h text-[clamp(3.2rem,17vw,17rem)]">Keep them.</h2>
        <Link to="/app" className="btn !bg-[var(--ink)] !border-[var(--ink)] !text-[var(--paper)] text-lg sm:text-xl !px-7 sm:!px-9 !py-3 sm:!py-4 mt-8 sm:mt-10">Open Kept, it is free</Link>
      </div></section>
      <footer className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row justify-between gap-4 items-center text-center sm:text-left"><Logo size={22} /><span className="label">Made for people who are the whole company.</span></footer>
    </div>
  )
}
