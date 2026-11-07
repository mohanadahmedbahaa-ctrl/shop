import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

function TextField({ label, error, className, ...inputProps }: Props) {
  // 1. useId creates a unique id per component instance, like ":r1:".
  //    We need ids to connect <label htmlFor> to <input id>, and the error text
  //    to the input via aria-describedby. Hardcoding ids would clash if reused.
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        // 2. aria-invalid + aria-describedby: screen readers say "invalid" and read the error.
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none transition',
          'placeholder:text-stone-400 focus:ring-2',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-stone-300 focus:border-brand-600 focus:ring-brand-100',
        )}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
