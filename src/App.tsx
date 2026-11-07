// 1. Import the component and the data.
//    `products` is a named export, so it goes in { }.
//    `ProductCard` is a default export, so there are no braces and you can name it anything.
import ProductCard from './components/ProductCard'
import { products } from './data/products'

// 2. App is the ROOT component. main.tsx renders <App />, and everything else lives inside it.
function App() {
  return (
    // min-h-screen = at least the full screen height, bg-gray-100 = light grey page
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 p-8">My Shop</h1>

      {/* 3. Responsive grid with Tailwind:
          grid-cols-1 on phones, sm:grid-cols-2 from 640px, lg:grid-cols-3 from 1024px.
          gap-6 = space between cards, px-8 pb-8 = padding on the sides and bottom. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8 pb-8">
        {/* 4. Rendering a LIST: `.map()` turns each product object into a <ProductCard />.
            Same idea as a for-loop that builds HTML, but it returns a new array of JSX.

            5. `key={product.id}`: React needs a unique, stable key for each list item
            so it knows which item changed, was added or was removed when the list updates.
            Use an id. Don't use the array index if items can be reordered or deleted.

            6. `product={product}` passes the PROP down. Inside ProductCard it arrives
            as `{ product }`. Data flows one way in React: parent → child. */}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default App
