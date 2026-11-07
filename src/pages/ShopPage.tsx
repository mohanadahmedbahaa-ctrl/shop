import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import ProductGrid from '../components/product/ProductGrid'
import FilterPanel from '../components/shop/FilterPanel'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { categoryInfo, products } from '../data/products'
import { applyFilters, priceRanges, readFilters, sortOptions } from '../utils/productFilters'

function ShopPage() {
  // 1. THE URL IS THE STATE. Filters live in the query string (?category=home&sort=price-asc)
  //    instead of useState. Benefits: you can share or bookmark a filtered page, the back
  //    button undoes a filter, and a refresh keeps your filters.
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const results = applyFilters(products, filters)

  // Pure UI state (is the mobile filter panel open?) doesn't belong in the URL, so it's useState.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // 2. One function to change any filter. We copy the params (never mutate them),
  //    change one key, and hand the new object to React Router.
  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams)
    if (value === null) next.delete(key)
    else next.set(key, value)
    setSearchParams(next)
  }

  function clearAll() {
    setSearchParams({})
  }

  // 3. "Chips" for each active filter, so users see what's applied and can remove it in one click.
  const chips: { label: string; key: string }[] = []
  if (filters.query) chips.push({ label: `"${filters.query}"`, key: 'q' })
  if (filters.category) chips.push({ label: categoryInfo[filters.category].name, key: 'category' })
  if (filters.priceRange) {
    chips.push({ label: priceRanges.find((r) => r.id === filters.priceRange)?.label ?? '', key: 'price' })
  }
  if (filters.minRating) chips.push({ label: `${filters.minRating}★ & up`, key: 'rating' })
  if (filters.onSale) chips.push({ label: 'On sale', key: 'sale' })

  // The page heading adapts to what you're looking at.
  const heading = filters.query
    ? `Results for "${filters.query}"`
    : filters.category
      ? categoryInfo[filters.category].name
      : filters.onSale
        ? 'Sale'
        : 'All products'
  const subheading = filters.category ? categoryInfo[filters.category].tagline : 'Everyday essentials, thoughtfully chosen.'

  return (
    <Container className="pt-8">
      <title>{`${heading} · Oakline`}</title>

      <Breadcrumbs
        items={
          filters.category
            ? [{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: categoryInfo[filters.category].name }]
            : [{ label: 'Home', to: '/' }, { label: 'Shop' }]
        }
      />

      <div className="mt-6 border-b border-stone-200 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-stone-600">{subheading}</p>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12">
        {/* Desktop sidebar: sticky so the filters stay visible while you scroll the products */}
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel filters={filters} onChange={setParam} />
          </div>
        </aside>

        <section aria-labelledby="results-heading">
          {/* Toolbar: result count, mobile filter button, sort */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* aria-live: screen readers announce the new count when filters change */}
            <p id="results-heading" className="text-sm text-stone-600" aria-live="polite">
              {results.length} {results.length === 1 ? 'product' : 'products'}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen((open) => !open)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-filters"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters {chips.length > 0 && `(${chips.length})`}
              </Button>

              <label className="flex items-center gap-2 text-sm">
                <span className="text-stone-600">Sort by</span>
                {/* A CONTROLLED <select>: value comes from the URL, onChange writes to the URL. */}
                <select
                  value={filters.sort}
                  onChange={(e) => setParam('sort', e.target.value === 'featured' ? null : e.target.value)}
                  className="h-9 rounded-full border border-stone-300 bg-white pl-3 pr-8 text-sm font-medium outline-none focus:border-stone-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Mobile filter panel, toggled by the Filters button */}
          {mobileFiltersOpen && (
            <div id="mobile-filters" className="mt-4 rounded-2xl border border-stone-200 p-6 lg:hidden">
              <FilterPanel filters={filters} onChange={setParam} />
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {results.length} products
              </Button>
            </div>
          )}

          {chips.length > 0 && (
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => setParam(chip.key, null)}
                    aria-label={`Remove filter: ${chip.label}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 py-1.5 pl-3 pr-2 text-xs font-medium hover:bg-stone-200"
                  >
                    {chip.label}
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={clearAll} className="px-2 text-xs font-medium text-stone-600 underline hover:text-stone-900">
                  Clear all
                </button>
              </li>
            </ul>
          )}

          <div className="mt-8">
            {results.length > 0 ? (
              <ProductGrid products={results} columns={3} />
            ) : (
              // EMPTY STATE with a way out. A dead end ("0 results") loses customers.
              <div className="flex flex-col items-center rounded-3xl bg-stone-50 px-6 py-20 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-white shadow-sm">
                  <Search className="size-6 text-stone-400" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">No products found</h2>
                <p className="mt-1 max-w-sm text-sm text-stone-500">
                  Try a different search, or remove some filters to see more results.
                </p>
                <Button className="mt-6" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Container>
  )
}

export default ShopPage
