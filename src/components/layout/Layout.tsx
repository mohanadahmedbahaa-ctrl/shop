import { LoaderCircle, Truck, WifiOff } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useProducts } from '../../context/ProductsContext'
import { FREE_SHIPPING_THRESHOLD } from '../../utils/pricing'
import CartDrawer from '../cart/CartDrawer'
import Button from '../ui/Button'
import Container from '../ui/Container'
import Footer from './Footer'
import Header from './Header'

function CatalogGate() {
  const { status, error, reload } = useProducts()

  if (status === 'loading') {
    return (
      <Container className="flex flex-col items-center py-32 text-stone-500">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
          <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
          <p className="text-sm">Loading products…</p>
        </div>
      </Container>
    )
  }

  if (status === 'error') {
    return (
      <Container className="flex flex-col items-center py-32 text-center">
        <WifiOff className="size-10 text-stone-400" aria-hidden="true" />
        <h1 className="mt-4 text-xl font-semibold">We couldn't load the store</h1>
        <p className="mt-2 max-w-md text-sm text-stone-600">{error}</p>
        <Button className="mt-6" onClick={reload}>
          Try again
        </Button>
      </Container>
    )
  }

  return <Outlet />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="bg-stone-900 px-4 py-2 text-center text-xs font-medium text-white">
        <Truck className="mr-1.5 inline size-3.5 align-[-2px]" aria-hidden="true" />
        Free shipping on orders over ${FREE_SHIPPING_THRESHOLD} · Free 30-day returns
      </div>

      <Header />

      <main id="main" className="flex-1">
        <CatalogGate />
      </main>

      <Footer />
      <CartDrawer />
    </div>
  )
}

export default Layout
