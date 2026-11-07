import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

// Centers content with a max width and consistent side padding on every page.
// Using one component means every page lines up perfectly with the header.
type Props = {
  children: ReactNode
  className?: string
}

function Container({ children, className }: Props) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}>{children}</div>
}

export default Container
