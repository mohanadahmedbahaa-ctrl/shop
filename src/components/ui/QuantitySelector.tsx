import { Minus, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'

type Props = {
  value: number
  onChange: (value: number) => void
  max: number
  min?: number
  label: string
  size?: 'sm' | 'md'
}

function QuantitySelector({ value, onChange, max, min = 1, label, size = 'md' }: Props) {
  const buttonClass = cn(
    'grid place-items-center text-stone-600 hover:text-stone-900 disabled:text-stone-300 disabled:cursor-not-allowed',
    size === 'sm' ? 'size-8' : 'size-11',
  )

  return (
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
