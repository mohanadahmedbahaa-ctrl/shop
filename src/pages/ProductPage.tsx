import { RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import ProductGallery from '../components/product/ProductGallery'
import ProductGrid from '../components/product/ProductGrid'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import Price from '../components/ui/Price'
import QuantitySelector from '../components/ui/QuantitySelector'
import Rating from '../components/ui/Rating'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { categoryInfo, type Product } from '../data/products'
import { formatPrice } from '../utils/formatPrice'
import { FREE_SHIPPING_THRESHOLD, getDiscountPercent } from '../utils/pricing'
import NotFoundPage from './NotFoundPage'

// 1. The ROUTE component only finds the product from the URL (/product/:id).
function ProductPage() {
  const { id } = useParams() // URL params are always strings: "3"
  const { products } = useProducts()
  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return <NotFoundPage title="Product not found" message="This product doesn't exist or is no longer available." />
  }

  // 2. `key={product.id}` is a trick worth knowing for interviews: when the key changes
  //    (you click a related product), React throws away the old component and its state
  //    and starts fresh. So quantity resets to 1 and the gallery goes back to image 1.
  return <ProductDetails key={product.id} product={product} />
}

function ProductDetails({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { products } = useProducts()
  const [quantity, setQuantity] = useState(1)

  const discount = getDiscountPercent(product)
  const lowStock = product.stock <= 10
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <>
      <title>{`${product.title} · Oakline`}</title>

      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: categoryInfo[product.category].name, to: `/shop?category=${product.category}` },
            { label: product.title },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div>
            <Link
              to={`/shop?category=${product.category}`}
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              {categoryInfo[product.category].name}
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{product.title}</h1>

            <div className="mt-4">
              <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </div>
            {/* Marketplace: products added by sellers show who sells them (sellerName comes from a SQL JOIN). */}
            <p className="mt-2 text-sm text-stone-500">
              Sold by <span className="font-medium text-stone-700">{product.sellerName ?? 'Oakline'}</span>
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Price product={product} size="lg" />
              {discount !== null && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700">
                  Save {discount}%
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-stone-600">{product.description}</p>

            {/* Stock status: a colored dot + text. Color alone isn't enough (color-blind users), so there's text too. */}
            <p className="mt-6 flex items-center gap-2 text-sm font-medium">
              <span className={`size-2 rounded-full ${lowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} aria-hidden="true" />
              {lowStock ? `Only ${product.stock} left. Order soon.` : 'In stock and ready to ship'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* The parent owns `quantity`; QuantitySelector only reports changes ("controlled"). */}
              <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} label="Quantity" />
              <Button size="lg" className="sm:flex-1" onClick={() => addToCart(product, quantity)}>
                <ShoppingBag className="size-5" aria-hidden="true" />
                Add to cart · {formatPrice(product.price * quantity)}
              </Button>
            </div>

            <ul className="mt-10 divide-y divide-stone-200 rounded-2xl border border-stone-200">
              <li className="flex items-center gap-4 p-4">
                <Truck className="size-5 shrink-0 text-stone-500" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-medium">Free shipping</p>
                  <p className="text-stone-500">On orders over ${FREE_SHIPPING_THRESHOLD}. Ships in 1–2 business days.</p>
                </div>
              </li>
              <li className="flex items-center gap-4 p-4">
                <RotateCcw className="size-5 shrink-0 text-stone-500" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-medium">Free 30-day returns</p>
                  <p className="text-stone-500">Not the right fit? Send it back for free.</p>
                </div>
              </li>
              <li className="flex items-center gap-4 p-4">
                <ShieldCheck className="size-5 shrink-0 text-stone-500" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-medium">Secure checkout</p>
                  <p className="text-stone-500">Your information is protected.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <Container className="mt-24">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight">You may also like</h2>
          <ProductGrid products={related} />
        </Container>
      )}
    </>
  )
}

export default ProductPage
