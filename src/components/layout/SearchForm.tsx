import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { cn } from '../../utils/cn'

type Props = {
  className?: string
  onSearch?: () => void // e.g. close the mobile menu after searching
}

function SearchForm({ className, onSearch }: Props) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''

  // 1. UNCONTROLLED input: we don't keep it in state. We read it once, on submit,
  //    with FormData (the browser's own API for reading a form's fields by `name`).
  //    Fine here because we only need the value at the end, not on every keystroke.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stop the browser's default full page reload
    const query = String(new FormData(event.currentTarget).get('q') ?? '').trim()
    // encodeURIComponent makes text URL-safe: "a & b" -> "a%20%26%20b"
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
    onSearch?.() // ?.() = call it only if it was passed
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
      {/* 2. `key={currentQuery}`: when the URL's ?q= changes (e.g. "Clear filters"),
          React re-creates the input, so defaultValue shows the new value. */}
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
