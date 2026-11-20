import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return <div className="max-w-6xl mx-auto px-5 py-8"><Link to="/"><Logo /></Link><div className="mt-24"><p className="h text-[clamp(8rem,30vw,22rem)]">404<span style={{ color: 'var(--red)' }}>.</span></p><p className="text-2xl font-semibold">This page isn’t kept here.</p><Link to="/" className="btn mt-8">Back home</Link></div></div>
}
