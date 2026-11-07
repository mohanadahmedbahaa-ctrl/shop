import { ImageOff } from 'lucide-react'
import { Link } from 'react-router'
import type { OrderItem } from '../../types/order'
import { formatPrice } from '../../utils/formatPrice'

function OrderItemList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item, index) => (
        <li key={`${item.productId}-${index}`} className="flex items-center gap-4">
          {item.image ? (
            <img src={item.image} alt="" className="size-14 shrink-0 rounded-lg bg-stone-100 object-contain p-1 mix-blend-multiply" />
          ) : (
            <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-stone-100">
              <ImageOff className="size-5 text-stone-400" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1 text-sm">
            {item.productId ? (
              <Link to={`/product/${item.productId}`} className="font-medium hover:underline">
                {item.title}
              </Link>
            ) : (
              <p className="font-medium">
                {item.title} <span className="font-normal text-stone-400">(no longer sold)</span>
              </p>
            )}
            <p className="text-stone-500">
              {item.quantity} × {formatPrice(item.unitPrice)}
            </p>
          </div>
          <p className="text-sm tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</p>
        </li>
      ))}
    </ul>
  )
}

export default OrderItemList
