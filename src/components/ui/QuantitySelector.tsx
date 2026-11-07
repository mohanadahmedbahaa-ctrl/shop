import { Minus, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'

// A "CONTROLLED" component: it doesn't keep its own state.
// The parent owns `value` and decides what happens in `onChange`.
// That's why the SAME component works on the product page (local state)
// and in the cart (context state).
type Props = {
  value: number
  onChange: (value: number) => void
  max: number
  min?: number
  label: string // for screen readers, e.g. "Quantity for Table Lamp"
  size?: 'sm' | 'md'
}

function QuantitySelector({ value, onChange, max, min = 1, label, size = 'md' }: Props) {
  const buttonClass = cn(
    'grid place-items-center text-stone-600 hover:text-stone-900 disabled:text-stone-300 disabled:cursor-not-allowed',
    size === 'sm' ? 'size-8' : 'size-11',
  )

  return (
    // role="group" + aria-label groups the 3 controls under one name for assistive tech
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full ring-1 ring-inset ring-stone-300"
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      {/* aria-live="polite": screen readers announce the new number when it changes */}
      <span className={cn('text-center font-medium tabular-nums', size === 'sm' ? 'w-6 text-sm' : 'w-8')} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export default QuantitySelector
