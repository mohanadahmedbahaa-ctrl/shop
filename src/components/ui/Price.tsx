import type { Product } from '../../data/products'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatPrice'

type Props = {
  product: Product
  size?: 'sm' | 'lg'
}

// Shows the price, plus the old crossed-out price when the product is on sale.
function Price({ product, size = 'sm' }: Props) {
  // TypeScript remembers WHY `onSale` is true ("aliased condition"), so inside
  // `onSale && ...` it knows compareAt is a number, not undefined.
  const compareAt = product.compareAtPrice
  const onSale = compareAt !== undefined && compareAt > product.price

  return (
    <div className="flex items-baseline gap-2">
      <span className={cn('font-semibold', onSale && 'text-red-600', size === 'lg' ? 'text-3xl' : 'text-sm')}>
        {formatPrice(product.price)}
      </span>
      {/* <s> = "no longer accurate" (strikethrough). sr-only text is read by
          screen readers but hidden visually, so the meaning isn't lost. */}
      {onSale && (
        <s className={cn('text-stone-400', size === 'lg' ? 'text-lg' : 'text-xs')}>
          <span className="sr-only">Original price: </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </div>
  )
}

export default Price
