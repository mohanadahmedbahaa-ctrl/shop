import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { useCart } from '../../context/CartContext'
import { categoryInfo, type Product } from '../../data/products'
import { getDiscountPercent } from '../../utils/pricing'
import Price from '../ui/Price'
import Rating from '../ui/Rating'

type Props = {
  product: Product
}

function ProductCard({ product }: Props) {
  const { addToCart } = useCart()
  const discount = getDiscountPercent(product)
  const lowStock = product.stock <= 10

  return (
    <article className="group relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="size-full object-contain p-6 mix-blend-multiply transition duration-300 group-hover:scale-105"
          />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount !== null && (
              <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            )}
            {lowStock && (
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <p className="text-xs text-stone-500">{categoryInfo[product.category].name}</p>
          <h3 className="text-sm font-medium text-stone-900 group-hover:underline underline-offset-2">
            {product.title}
          </h3>
          <Rating rating={product.rating} reviewCount={product.reviewCount} />
          <Price product={product} />
        </div>
      </Link>

      <button
        type="button"
        onClick={() => addToCart(product)}
        aria-label={`Add ${product.title} to cart`}
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-stone-900 shadow-md transition hover:bg-stone-900 hover:text-white lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Plus className="size-5" aria-hidden="true" />
      </button>
    </article>
  )
}

export default ProductCard
