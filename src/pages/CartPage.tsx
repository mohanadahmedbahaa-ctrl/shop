import { useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/formatPrice'

function CartPage() {
  // 1. Everything comes from context. This page never owns the cart; it only shows and changes it.
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart()

  // 2. LOCAL state that only this page cares about: did the user just "check out"?
  //    Rule of thumb: keep state as close as possible to where it's used.
  const [orderPlaced, setOrderPlaced] = useState(false)

  function handleCheckout() {
    // There's no backend yet (that's Phase 2!), so checkout just empties the cart.
    clearCart()
    setOrderPlaced(true)
  }

  // 3. Two early returns for the special cases: order placed, or empty cart.
  if (orderPlaced) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Thank you for your order! 🎉</h1>
        <p className="text-gray-600 mb-6">This is a demo shop, so nothing was charged.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your cart ({totalItems} items)</h1>

      {/* lg:grid-cols-3 + lg:col-span-2: on large screens items take 2/3, summary 1/3 */}
      <div className="grid lg:grid-cols-3 gap-8">
        <ul className="lg:col-span-2 flex flex-col gap-4">
          {/* 4. Destructuring inside the .map() parameter: ({ product, quantity }) */}
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 bg-white rounded-lg shadow p-4">
              <img
                src={product.image}
                alt={product.title}
                className="w-24 h-24 object-cover rounded"
              />

              <div className="flex-1">
                <Link to={`/product/${product.id}`} className="font-semibold hover:text-blue-600">
                  {product.title}
                </Link>
                <p className="text-gray-500">{formatPrice(product.price)} each</p>

                {/* 5. Quantity controls. Each button calls the context function with a new number.
                    Going to 0 removes the item (see updateQuantity in CartProvider.tsx). */}
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label={`Decrease ${product.title} quantity`}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label={`Increase ${product.title} quantity`}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="ml-4 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Line total: price × quantity, calculated right here in JSX */}
              <p className="font-bold">{formatPrice(product.price * quantity)}</p>
            </li>
          ))}
        </ul>

        {/* 6. Order summary. `h-fit` stops it stretching to the height of the list. */}
        <aside className="bg-white rounded-lg shadow p-6 h-fit flex flex-col gap-4">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-bold">{formatPrice(totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded py-3"
          >
            Checkout
          </button>
          <button type="button" onClick={clearCart} className="text-sm text-gray-500 hover:underline">
            Clear cart
          </button>
        </aside>
      </div>
    </div>
  )
}

export default CartPage
