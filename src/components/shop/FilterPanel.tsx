import type { ReactNode } from 'react'
import { useProducts } from '../../context/ProductsContext'
import { categories, categoryInfo } from '../../data/products'
import { priceRanges, type ProductFilters } from '../../utils/productFilters'

type Props = {
  filters: ProductFilters
  // The panel doesn't change the URL itself; it tells the parent what to change.
  // "Lifting state up": the Shop page owns the filters, the panel just displays them.
  onChange: (key: string, value: string | null) => void
}

// <fieldset> + <legend> = the semantic way to group related radio buttons.
function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-stone-200 py-6 first:pt-0">
      {/* float-left + w-full makes <legend> behave like a normal block (browsers place it on the border by default) */}
      <legend className="float-left mb-4 w-full text-sm font-semibold">{legend}</legend>
      <div className="clear-left space-y-3">{children}</div>
    </fieldset>
  )
}

// One radio option. Radios with the same `name` form a group where only one can be checked.
// accent-stone-900 colors the native radio (CSS `accent-color`), no custom drawing needed.
function RadioOption(props: { name: string; label: string; count?: number; checked: boolean; onSelect: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700 hover:text-stone-900">
      <input
        type="radio"
        name={props.name}
        checked={props.checked}
        onChange={props.onSelect}
        className="size-4 accent-stone-900"
      />
      <span className="flex-1">{props.label}</span>
      {props.count !== undefined && <span className="text-xs text-stone-400">{props.count}</span>}
    </label>
  )
}

function FilterPanel({ filters, onChange }: Props) {
  // How many products are in each category, for the "(5)" counts next to each option.
  // Computed inside the component now, because the products come from the API.
  const { products } = useProducts()
  const categoryCounts = Object.fromEntries(
    categories.map((c) => [c, products.filter((p) => p.category === c).length]),
  )

  return (
    <div>
      <FilterGroup legend="Category">
        <RadioOption
          name="category"
          label="All categories"
          count={products.length}
          checked={filters.category === null}
          onSelect={() => onChange('category', null)}
        />
        {categories.map((c) => (
          <RadioOption
            key={c}
            name="category"
            label={categoryInfo[c].name}
            count={categoryCounts[c]}
            checked={filters.category === c}
            onSelect={() => onChange('category', c)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Price">
        <RadioOption name="price" label="Any price" checked={filters.priceRange === null} onSelect={() => onChange('price', null)} />
        {priceRanges.map((range) => (
          <RadioOption
            key={range.id}
            name="price"
            label={range.label}
            checked={filters.priceRange === range.id}
            onSelect={() => onChange('price', range.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Rating">
        <RadioOption name="rating" label="Any rating" checked={filters.minRating === null} onSelect={() => onChange('rating', null)} />
        {[4, 3].map((stars) => (
          <RadioOption
            key={stars}
            name="rating"
            label={`${stars}★ & up`}
            checked={filters.minRating === stars}
            onSelect={() => onChange('rating', String(stars))}
          />
        ))}
      </FilterGroup>

      <div className="py-6">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => onChange('sale', e.target.checked ? 'true' : null)}
            className="size-4 rounded accent-stone-900"
          />
          On sale only
        </label>
      </div>
    </div>
  )
}

export default FilterPanel
