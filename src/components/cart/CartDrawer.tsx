import { ShoppingBag, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../context/CartContext'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatPrice'
import { buttonStyles } from '../ui/buttonStyles'
import CartLineItem from './CartLineItem'
import FreeShippingProgress from './FreeShippingProgress'

function CartDrawer() {
  const { items, itemCount, subtotal, isCartOpen, closeCart } = useCart()

  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isCartOpen) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isCartOpen, closeCart])

  return (
    <div
      className={cn('fixed inset-0 z-50', isCartOpen ? 'visible' : 'invisible')}
      inert={!isCartOpen}
    >
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-stone-900/40 transition-opacity duration-300',
          isCartOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
          isCartOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 id="cart-drawer-title" className="text-lg font-semibold">
            Your cart <span className="text-stone-400">({itemCount})</span>
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid size-10 place-items-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-stone-100">
              <ShoppingBag className="size-7 text-stone-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm text-stone-500">Find something you love in our collection.</p>
            </div>
            <Link to="/shop" onClick={closeCart} className={buttonStyles('primary', 'md', 'mt-2')}>
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="pt-5">
                <FreeShippingProgress subtotal={subtotal} />
              </div>
              <ul className="divide-y divide-stone-200">
                {items.map((item) => (
                  <CartLineItem key={item.product.id} item={item} onNavigate={closeCart} />
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200 px-6 py-6">
              <div className="flex justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-sm text-stone-500">Shipping and taxes are calculated at checkout.</p>
              <div className="mt-5 grid gap-3">
                <Link to="/checkout" onClick={closeCart} className={buttonStyles('primary', 'lg', 'w-full')}>
                  Checkout
                </Link>
                <Link to="/cart" onClick={closeCart} className={buttonStyles('secondary', 'lg', 'w-full')}>
                  View cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default CartDrawer
