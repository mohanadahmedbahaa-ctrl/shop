// Filtering and sorting logic for the Shop page, kept OUT of the component.
// Components should mostly describe UI; data logic in plain functions is easier to read and test.
import { categories, type Category, type Product } from '../data/products'
import { getDiscountPercent } from './pricing'

// 1. `as const` makes TypeScript treat these as fixed literal values
//    (id: 'under-25' instead of id: string), so we can derive exact types from them.
export const priceRanges = [
  { id: 'under-25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 – $50', min: 25, max: 50 },
  { id: '50-100', label: '$50 – $100', min: 50, max: 100 },
  { id: 'over-100', label: 'Over $100', min: 100, max: Infinity },
] as const

export const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'discount', label: 'Biggest discount' },
] as const

// 2. DERIVED TYPES: "the type of any `id` inside sortOptions".
//    That gives 'featured' | 'price-asc' | ... and stays in sync automatically.
export type SortId = (typeof sortOptions)[number]['id']
export type PriceRangeId = (typeof priceRanges)[number]['id']

export type ProductFilters = {
  query: string
  category: Category | null
  priceRange: PriceRangeId | null
  minRating: number | null
  onSale: boolean
  sort: SortId
}

// 3. TYPE GUARDS: functions returning `value is X`.
//    After `if (isCategory(v))`, TypeScript knows v is a Category, not just any string.
//    Needed because URL values are untrusted strings: a user can type ?category=banana.
export function isCategory(value: string | null): value is Category {
  return categories.some((c) => c === value)
}
function isPriceRange(value: string | null): value is PriceRangeId {
  return priceRanges.some((r) => r.id === value)
}
function isSortId(value: string | null): value is SortId {
  return sortOptions.some((s) => s.id === value)
}

// 4. Turn the URL (?category=home&sort=price-asc) into a typed, VALIDATED filters object.
//    Invalid values fall back to defaults instead of breaking the page.
export function readFilters(params: URLSearchParams): ProductFilters {
  const category = params.get('category')
  const price = params.get('price')
  const sort = params.get('sort')
  const rating = Number(params.get('rating'))

  return {
    query: params.get('q')?.trim() ?? '',
    category: isCategory(category) ? category : null,
    priceRange: isPriceRange(price) ? price : null,
    minRating: rating >= 1 && rating <= 5 ? rating : null,
    onSale: params.get('sale') === 'true',
    sort: isSortId(sort) ? sort : 'featured',
  }
}

export function applyFilters(list: Product[], filters: ProductFilters): Product[] {
  const query = filters.query.toLowerCase()
  const range = priceRanges.find((r) => r.id === filters.priceRange)

  const filtered = list.filter((p) => {
    if (filters.category && p.category !== filters.category) return false
    if (range && (p.price < range.min || p.price >= range.max)) return false
    if (filters.minRating && p.rating < filters.minRating) return false
    if (filters.onSale && getDiscountPercent(p) === null) return false
    if (query && !`${p.title} ${p.category}`.toLowerCase().includes(query)) return false
    return true
  })

  // 5. .toSorted() returns a NEW sorted array. Plain .sort() MUTATES the original array,
  //    which would scramble our shared `products` data. A classic bug!
  //    The compare function returns a negative number if a comes first, positive if b comes first.
  switch (filters.sort) {
    case 'price-asc':
      return filtered.toSorted((a, b) => a.price - b.price)
    case 'price-desc':
      return filtered.toSorted((a, b) => b.price - a.price)
    case 'rating':
      return filtered.toSorted((a, b) => b.rating - a.rating)
    case 'discount':
      return filtered.toSorted((a, b) => (getDiscountPercent(b) ?? 0) - (getDiscountPercent(a) ?? 0))
    default:
      return filtered
  }
}
