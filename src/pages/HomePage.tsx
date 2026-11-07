import { ArrowRight, PackageCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router'
import ProductGrid from '../components/product/ProductGrid'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'
import { useProducts } from '../context/ProductsContext'
import { categories, categoryInfo, type Category } from '../data/products'
import { FREE_SHIPPING_THRESHOLD, getDiscountPercent } from '../utils/pricing'

// Hand-picked "cover" product for each category tile (ids from the seeded catalog).
// If one is ever deleted, the tile just shows no image (see `cover &&` below).
const categoryCovers: Record<Category, number> = { home: 3, kitchen: 6, fashion: 15, accessories: 18, sport: 25 }
const heroIds = [5, 19, 21]

const perks = [
  { icon: Truck, title: 'Free shipping', text: `On orders over $${FREE_SHIPPING_THRESHOLD}` },
  { icon: RotateCcw, title: 'Free returns', text: 'Within 30 days' },
  { icon: PackageCheck, title: 'Fast dispatch', text: 'Ships in 1–2 business days' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'Your data stays safe' },
]

// 2. A small component used only on this page. It's defined OUTSIDE HomePage:
//    defining components inside other components makes React re-create them every render.
function SectionHeading({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <Link to={linkTo} className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-stone-700 hover:text-stone-900">
        {linkLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

function HomePage() {
  // 1. Phase 1 computed these at module level from a static array. The products now come from
  //    the API (they can change while the app runs), so they're derived INSIDE the component,
  //    on each render. 27 products = microseconds; useMemo would only matter for big lists.
  const { products } = useProducts()
  const findProduct = (id: number) => products.find((p) => p.id === id)

  const heroProducts = heroIds.map(findProduct)
  const bestSellers = products.toSorted((a, b) => b.rating - a.rating).slice(0, 4)
  const saleProducts = products
    .filter((p) => getDiscountPercent(p) !== null)
    .toSorted((a, b) => (getDiscountPercent(b) ?? 0) - (getDiscountPercent(a) ?? 0))
    .slice(0, 4)
  // `0` in the list: Math.max() of an EMPTY list is -Infinity, which would print "Up to -Infinity% off".
  const maxDiscount = Math.max(0, ...products.map((p) => getDiscountPercent(p) ?? 0))

  return (
    <>
      {/* React 19: a <title> anywhere in a component is moved into <head> automatically. */}
      <title>Oakline · Everyday essentials</title>

      {/* ───── HERO ───── */}
      <Container className="pt-6">
        <section className="grid overflow-hidden rounded-3xl bg-stone-100 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">New season</p>
            {/* text-balance spreads the words evenly over the lines, so there's no lonely last word */}
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Everyday essentials, thoughtfully chosen.
            </h1>
            <p className="mt-6 max-w-md text-lg text-stone-600">
              Home, kitchen, fashion and more. Well-made pieces at fair prices, delivered fast.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className={buttonStyles('primary', 'lg')}>
                Shop all products
              </Link>
              <Link to="/shop?sale=true" className={buttonStyles('secondary', 'lg')}>
                Shop the sale
              </Link>
            </div>
          </div>

          {/* Image collage: the first tile spans 2 rows (row-span-2). */}
          <div className="grid grid-cols-2 gap-4 p-6 sm:p-12 lg:pl-0">
            {heroProducts.map(
              (product, index) =>
                product && (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className={`group overflow-hidden rounded-2xl bg-white ${index === 0 ? 'row-span-2' : 'aspect-square'}`}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="size-full object-contain p-6 transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                ),
            )}
          </div>
        </section>
      </Container>

      {/* ───── PERKS ─────
          `icon: Icon` renames while destructuring. Components must be Capitalized to use as <Icon />. */}
      <Container className="mt-12">
        <ul className="grid grid-cols-2 gap-6 border-y border-stone-200 py-8 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-sm text-stone-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* ───── CATEGORIES ───── */}
      <Container className="mt-20">
        <SectionHeading title="Shop by category" linkTo="/shop" linkLabel="Browse all" />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const cover = findProduct(categoryCovers[category])
            const count = products.filter((p) => p.category === category).length
            return (
              <li key={category}>
                <Link to={`/shop?category=${category}`} className="group block">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
                    {cover && (
                      <img
                        src={cover.images[0]}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain p-6 mix-blend-multiply transition duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-3 font-medium group-hover:underline">{categoryInfo[category].name}</p>
                  <p className="text-sm text-stone-500">{count} products</p>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>

      {/* ───── BEST SELLERS ───── */}
      <Container className="mt-20">
        <SectionHeading title="Top rated" linkTo="/shop?sort=rating" linkLabel="See all" />
        <ProductGrid products={bestSellers} />
      </Container>

      {/* ───── SALE BANNER ───── */}
      <Container className="mt-20">
        <section className="relative overflow-hidden rounded-3xl bg-stone-900 px-6 py-16 text-center text-white sm:px-12">
          {/* Decorative blurred circles: pure CSS, aria-hidden because they mean nothing */}
          <div aria-hidden="true" className="absolute -left-20 -top-20 size-72 rounded-full bg-brand-600/40 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 -right-16 size-72 rounded-full bg-red-500/30 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">Limited time</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Up to {maxDiscount}% off selected items</h2>
            <p className="mx-auto mt-4 max-w-md text-stone-300">Fresh deals on fashion, kitchen and accessories while stock lasts.</p>
            <Link to="/shop?sale=true" className={buttonStyles('secondary', 'lg', 'mt-8 ring-0')}>
              Shop the sale
            </Link>
          </div>
        </section>
      </Container>

      {/* ───── ON SALE ───── */}
      <Container className="mt-20">
        <SectionHeading title="On sale now" linkTo="/shop?sale=true" linkLabel="View all deals" />
        <ProductGrid products={saleProducts} />
      </Container>
    </>
  )
}

export default HomePage
