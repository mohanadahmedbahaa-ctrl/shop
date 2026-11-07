import { Link, useParams } from 'react-router'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { formatPrice } from '../utils/formatPrice'

function ProductDetailsPage() {
  // 1. useParams reads the dynamic part of the URL.
  //    The route is "/product/:id", so for "/product/3" we get { id: "3" }.
  //    URL params are ALWAYS strings (or undefined), so we convert with Number().
  const { id } = useParams()
  const product = products.find((p) => p.id === Number(id))

  const { addToCart } = useCart()

  // 2. EARLY RETURN: handle the "not found" case first (e.g. /product/999).
  //    After this `if`, TypeScript KNOWS `product` is defined ("type narrowing"),
  //    so product.title below is safe and causes no "possibly undefined" error.
  if (!product) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          ← Back to products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/" className="text-blue-600 hover:underline">
        ← Back to products
      </Link>

      {/* md:grid-cols-2 = image and text side by side on medium screens and up */}
      <div className="mt-6 grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow p-6">
        <img
          src={product.image}
          alt={product.title}
          className="w-full aspect-square object-cover rounded"
        />

        <div className="flex flex-col gap-4">
          <p className="text-sm uppercase text-gray-500">{product.category}</p>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-2xl text-blue-600 font-bold">{formatPrice(product.price)}</p>
          <p className="text-gray-700">{product.description}</p>

          <button
            type="button"
            onClick={() => addToCart(product)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded py-3 sm:w-48"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
