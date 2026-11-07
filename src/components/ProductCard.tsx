// 1. `import type` imports only a TYPE. It's removed from the final JavaScript.
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'
import type { Product } from '../data/products'
import { formatPrice } from '../utils/formatPrice'

// 2. PROPS are a component's inputs, like function arguments.
//    The parent must pass one prop, `product`, shaped like a Product.
type Props = {
  product: Product
}

// 3. A component is a function that returns JSX. The name must start with a capital letter.
//    `{ product }: Props` DESTRUCTURES the props object: props = { product: {...} }.
function ProductCard({ product }: Props) {
  // 4. Get the add function from the cart context (see context/CartContext.ts).
  //    Before, this button only did console.log. Now it changes real shared state.
  const { addToCart } = useCart()

  // 5. JSX rules: `className` instead of `class` (class is a JS keyword),
  //    and { } lets you put any JavaScript expression inside the markup.
  return (
    // h-full + flex flex-col: all cards in a row have the same height
    <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full">
      {/* 6. Link to the details page. The template string builds e.g. "/product/3".
          The `:id` route in App.tsx catches it. */}
      <Link to={`/product/${product.id}`} className="group">
        {/* object-cover = crop the image instead of stretching it.
            group-hover:opacity-90 = dim the image when hovering the whole Link ("group"). */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover rounded group-hover:opacity-90"
        />
        <p className="mt-3 text-xs uppercase text-gray-500">{product.category}</p>
        <h2 className="text-lg font-semibold group-hover:text-blue-600">{product.title}</h2>
      </Link>

      <p className="text-blue-600 font-bold">{formatPrice(product.price)}</p>

      {/* 7. onClick takes a FUNCTION. It doesn't take a function call.
          ✅ onClick={() => addToCart(product)} runs on click.
          ❌ onClick={addToCart(product)} runs immediately on every render.
          mt-auto pushes the button to the bottom of the card. */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

// 8. A default export, so it's imported without braces: import ProductCard from '...'
export default ProductCard
