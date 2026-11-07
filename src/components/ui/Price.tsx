import type { Product } from '../../data/products'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatPrice'

type Props = {
  product: Product
  size?: 'sm' | 'lg'
}

function Price({ product, size = 'sm' }: Props) {
  const compareAt = product.compareAtPrice
  const onSale = compareAt !== undefined && compareAt > product.price

  return (
    <div className="flex items-baseline gap-2">
      <span className={cn('font-semibold', onSale && 'text-red-600', size === 'lg' ? 'text-3xl' : 'text-sm')}>
        {formatPrice(product.price)}
      </span>
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
