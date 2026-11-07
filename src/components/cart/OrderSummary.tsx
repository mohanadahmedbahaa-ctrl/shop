import type { ReactNode } from 'react'
import { formatPrice } from '../../utils/formatPrice'
import type { OrderTotals } from '../../utils/pricing'

type Props = {
  totals: OrderTotals
  title?: string
  shippingNote?: string
  children?: ReactNode // slot for buttons under the totals (Checkout, Place order...)
}

// "Composition": the summary doesn't know which button goes under it.
// The cart page passes a Checkout link; checkout passes a Place-order button.
function OrderSummary({ totals, title = 'Order summary', shippingNote, children }: Props) {
  return (
    <section aria-labelledby="summary-heading" className="rounded-2xl bg-stone-50 p-6">
      <h2 id="summary-heading" className="text-lg font-semibold">
        {title}
      </h2>

      {/* <dl> = a description list, the semantic HTML for label/value pairs */}
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Subtotal</dt>
          <dd className="font-medium tabular-nums">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-600">
            Shipping {shippingNote && <span className="text-stone-400">({shippingNote})</span>}
          </dt>
          <dd className="font-medium tabular-nums">
            {totals.shipping === 0 ? <span className="text-brand-700">Free</span> : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-600">Estimated tax</dt>
          <dd className="font-medium tabular-nums">{formatPrice(totals.tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-stone-200 pt-4 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-semibold tabular-nums">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </section>
  )
}

export default OrderSummary
