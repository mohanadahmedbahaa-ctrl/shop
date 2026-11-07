import type { Product } from '../../data/products'
import { cn } from '../../utils/cn'
import ProductCard from './ProductCard'

type Props = {
  products: Product[]
  columns?: 3 | 4
}

// 2 columns on phones (standard for shopping apps), more on bigger screens.
function ProductGrid({ products, columns = 4 }: Props) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3',
        columns === 4 && 'xl:grid-cols-4',
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
