import { Link } from 'react-router'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2" aria-label="E-commerce home">
      <span className="grid size-8 place-items-center rounded-lg bg-stone-900 text-sm font-bold text-white" aria-hidden="true">
        E
      </span>
      <span className="text-lg font-semibold tracking-tight">E-commerce</span>
    </Link>
  )
}

export default Logo
