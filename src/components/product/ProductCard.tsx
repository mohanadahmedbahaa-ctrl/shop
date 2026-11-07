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
    // `group` lets children react to hovering the WHOLE card: group-hover:...
    // `relative` is the anchor for the absolutely-positioned quick-add button.
    <article className="group relative">
      {/* 1. HTML RULE: a <button> can't go inside an <a>. So the Link wraps image + text,
          and the quick-add button is a SIBLING placed on top with `absolute`. */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
          {/* 2. mix-blend-multiply makes the white photo background blend into the grey tile,
              so every product looks like the same studio shot.
              loading="lazy" = the browser only downloads images near the screen. */}
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="size-full object-contain p-6 mix-blend-multiply transition duration-300 group-hover:scale-105"
          />

          {/* Badges in the top-left corner */}
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

      {/* 3. Quick add. Always visible on touch screens; on desktop (lg) it fades in on hover.
          focus-visible:opacity-100 keeps it reachable with the keyboard (Tab key). */}
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
