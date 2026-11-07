import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'

// 1. Build the category list FROM the data, so adding a new category needs no code change.
//    new Set(...) removes duplicates; [...set] turns it back into an array.
//    This is outside the component because it never changes, so there's no need to redo it every render.
const categories = ['all', ...new Set(products.map((p) => p.category))]

function HomePage() {
  // 2. Two pieces of UI state: what the user typed, and which category is selected.
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  // 3. DERIVED data: the filtered list is calculated on every render from state + data.
  //    We do NOT store it in useState. It would just be a copy that could get out of sync.
  const query = search.trim().toLowerCase()
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === 'all' || product.category === category
    const matchesSearch = product.title.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  })

  return (
    <>
      {/* <> </> is a FRAGMENT: groups elements without adding an extra <div> to the page. */}
      <h1 className="text-3xl font-bold mb-6">Products</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* 4. CONTROLLED INPUT: React state is the "single source of truth".
            value={search} shows the state; onChange updates it on every keystroke.
            e.target.value is what's currently typed in the box. */}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white"
        />

        {/* 5. Category buttons, rendered from the array with .map().
            The string itself is the key (category names are unique).
            The template string + ternary switches classes for the selected button. */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded capitalize ${
                c === category ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Ternary for "either/or" rendering: a message if nothing matches, otherwise the grid. */}
      {visibleProducts.length === 0 ? (
        <p className="text-gray-500">No products match "{search}".</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product) => (
            // key: React needs a unique, stable id to track each item in a list.
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  )
}

export default HomePage
