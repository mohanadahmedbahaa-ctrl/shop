import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

type Crumb = { label: string; to?: string }

function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5 text-stone-400" aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-stone-900">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-stone-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
