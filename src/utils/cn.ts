// cn = "class names". Joins CSS classes and skips falsy values, so you can write:
//   cn('px-4', isActive && 'bg-black', className)
// If isActive is false, `false` is filtered out instead of ending up in the class string.
// (Libraries like `clsx` do the same thing. It's tiny, so we write it ourselves.)
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
