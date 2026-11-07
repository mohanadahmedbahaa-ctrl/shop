import { Link } from 'react-router'

// The store's logo: a simple mark + wordmark. Reused in the header and the footer.
function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2" aria-label="Oakline home">
      <span className="grid size-8 place-items-center rounded-lg bg-stone-900 text-sm font-bold text-white" aria-hidden="true">
        O
      </span>
      <span className="text-lg font-semibold tracking-tight">Oakline</span>
    </Link>
  )
}

export default Logo
