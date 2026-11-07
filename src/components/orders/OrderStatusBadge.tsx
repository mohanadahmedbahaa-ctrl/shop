import { orderStatusLabels, type OrderStatus } from '../../types/order'
import { cn } from '../../utils/cn'

const colors: Record<OrderStatus, string> = {
  placed: 'bg-amber-50 text-amber-800 ring-amber-200',
  shipped: 'bg-sky-50 text-sky-800 ring-sky-200',
  delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  cancelled: 'bg-stone-100 text-stone-600 ring-stone-200',
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', colors[status])}>
      {orderStatusLabels[status]}
    </span>
  )
}

export default OrderStatusBadge
