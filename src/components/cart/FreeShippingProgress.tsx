import { Truck } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { FREE_SHIPPING_THRESHOLD } from '../../utils/pricing'

function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const percent = Math.min(100, Math.max(0, (subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <div className="rounded-xl bg-brand-50 p-4">
      <p className="flex items-center gap-2 text-sm text-brand-900">
        <Truck className="size-4 shrink-0" aria-hidden="true" />
        {remaining > 0 ? (
          <span>
            You're <strong>{formatPrice(remaining)}</strong> away from free shipping
          </span>
        ) : (
          <span>
            <strong>You've unlocked free shipping!</strong>
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label="Progress to free shipping"
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-100"
      >
        <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default FreeShippingProgress
