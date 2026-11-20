// A red square with a K cut out of it.
export function Mark({ size = 26 }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" fill="#e30613" /><rect x="8" y="7" width="5" height="18" fill="#fff" /><path d="M24 7h-6l-5 9 5 9h6l-5-9z" fill="#fff" /></svg>
}
export default function Logo({ size = 26 }) {
  return <span className="inline-flex items-center gap-2.5"><Mark size={size} /><span className="h text-2xl" style={{ letterSpacing: '-.05em' }}>kept</span></span>
}
