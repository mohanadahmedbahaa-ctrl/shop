import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { cn } from '../../utils/cn'

type Props = {
  className?: string
  onSearch?: () => void
}

function SearchForm({ className, onSearch }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
    onSearch?.()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
      <input
        key={currentQuery}
        type="search"
        name="q"
        defaultValue={currentQuery}
        placeholder="Search products"
        aria-label="Search products"
        className="h-10 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
      />
    </form>
  )
}

export default SearchForm
