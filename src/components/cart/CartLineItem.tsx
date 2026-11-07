import { Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { useCart, type CartItem } from '../../context/CartContext'
import { categoryInfo } from '../../data/products'
import { formatPrice } from '../../utils/formatPrice'
import QuantitySelector from '../ui/QuantitySelector'

type Props = {
  item: CartItem
  onNavigate?: () => void
}

function CartLineItem({ item, onNavigate }: Props) {
  const { product, quantity } = item
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <li className="flex gap-4 py-5">
      <Link
        to={`/product/${product.id}`}
        onClick={onNavigate}
        className="size-24 shrink-0 overflow-hidden rounded-xl bg-stone-100"
      >
        <img src={product.images[0]} alt={product.title} className="size-full object-contain p-2 mix-blend-multiply" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between gap-4">
          <div>
            <Link
              to={`/product/${product.id}`}
              onClick={onNavigate}
              className="text-sm font-medium text-stone-900 hover:underline"
            >
              {product.title}
            </Link>
            <p className="mt-0.5 text-xs text-stone-500">{categoryInfo[product.category].name}</p>
          </div>
          <p className="text-sm font-semibold tabular-nums">{formatPrice(product.price * quantity)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            size="sm"
            value={quantity}
            max={product.stock}
            onChange={(next) => updateQuantity(product.id, next)}
            label={`Quantity for ${product.title}`}
          />
          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

export default CartLineItem
