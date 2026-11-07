import { cn } from '../../utils/cn'

// One place that defines how buttons look. Used by <Button> AND by <Link>s that
// should look like buttons ("Shop now", "Checkout"), so both stay identical.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

// Record<ButtonVariant, string> = one class string for every variant (TypeScript checks none is missing).
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-stone-900 text-white hover:bg-stone-700',
  secondary: 'bg-white text-stone-900 ring-1 ring-inset ring-stone-300 hover:bg-stone-50',
  ghost: 'text-stone-700 hover:bg-stone-100',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
}

export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className)
}
