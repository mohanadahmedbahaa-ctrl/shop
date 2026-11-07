import { Lock, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router'
import CartLineItem from '../components/cart/CartLineItem'
import FreeShippingProgress from '../components/cart/FreeShippingProgress'
import OrderSummary from '../components/cart/OrderSummary'
import ProductGrid from '../components/product/ProductGrid'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import { getOrderTotals } from '../utils/pricing'

const popular = products.toSorted((a, b) => b.reviewCount - a.reviewCount).slice(0, 4)

function CartPage() {
  const { items, itemCount, subtotal } = useCart()
  // The summary uses the same pricing function as checkout, so the numbers always match.
  const totals = getOrderTotals(subtotal, 'standard')

  if (items.length === 0) {
    return (
      <Container className="pt-16">
        <title>Your cart · Oakline</title>
        <div className="flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-full bg-stone-100">
            <ShoppingBag className="size-7 text-stone-400" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="mt-2 text-stone-600">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className={buttonStyles('primary', 'lg', 'mt-8')}>
            Start shopping
          </Link>
        </div>

        {/* An empty cart is a good place to suggest products instead of a dead end. */}
        <section className="mt-24">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">Popular right now</h2>
          <ProductGrid products={popular} />
        </section>
      </Container>
    )
  }

  return (
    <Container className="pt-10">
      <title>{`Your cart (${itemCount}) · Oakline`}</title>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Shopping cart</h1>

      {/* 12-column grid: items take 7 columns, the summary 5, on large screens. */}
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <section aria-label="Items in your cart" className="lg:col-span-7">
          <ul className="divide-y divide-stone-200 border-y border-stone-200">
            {items.map((item) => (
              <CartLineItem key={item.product.id} item={item} />
            ))}
          </ul>
          <Link to="/shop" className="mt-6 inline-block text-sm font-medium text-stone-700 hover:text-stone-900">
            ← Continue shopping
          </Link>
        </section>

        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
          <FreeShippingProgress subtotal={subtotal} />
          <OrderSummary totals={totals} shippingNote="standard">
            <Link to="/checkout" className={buttonStyles('primary', 'lg', 'w-full')}>
              Proceed to checkout
            </Link>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-stone-500">
              <Lock className="size-3.5" aria-hidden="true" />
              Secure checkout
            </p>
          </OrderSummary>
        </div>
      </div>
    </Container>
  )
}

export default CartPage
