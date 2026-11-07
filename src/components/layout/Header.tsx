import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { categories, categoryInfo } from '../../data/products'
import { cn } from '../../utils/cn'
import Container from '../ui/Container'
import Logo from './Logo'
import SearchForm from './SearchForm'

type NavItem = { label: string; to: string; match: (params: URLSearchParams) => boolean }

const navItems: NavItem[] = [
  { label: 'Shop all', to: '/shop', match: (p) => !p.get('category') && !p.get('sale') },
  ...categories.map((c) => ({
    label: categoryInfo[c].name,
    to: `/shop?category=${c}`,
    match: (p: URLSearchParams) => p.get('category') === c,
  })),
  { label: 'Sale', to: '/shop?sale=true', match: (p) => p.get('sale') === 'true' },
]

function Header() {
  const { itemCount, openCart } = useCart()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const isActive = (item: NavItem) => pathname === '/shop' && item.match(searchParams)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-2 xl:gap-8">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-stone-100 xl:hidden"
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>

        <Logo onClick={closeMenu} />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-6">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    item.label === 'Sale' ? 'text-red-600 hover:text-red-700' : 'text-stone-600 hover:text-stone-900',
                    isActive(item) && 'text-stone-900 underline decoration-2 underline-offset-[22px]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchForm className="hidden w-64 md:block" />

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Search"
            className="grid size-10 place-items-center rounded-full hover:bg-stone-100 md:hidden"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>

          <Link
            to={user ? '/account' : '/login'}
            onClick={closeMenu}
            aria-label={user ? `My account (${user.name})` : 'Log in'}
            className="relative grid size-10 place-items-center rounded-full hover:bg-stone-100"
          >
            <UserRound className="size-5" aria-hidden="true" />
            {user && <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-600 ring-2 ring-white" aria-hidden="true" />}
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative -mr-2 grid size-10 place-items-center rounded-full hover:bg-stone-100"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-4.5 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-4.5 text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-stone-200 bg-white xl:hidden">
          <Container className="py-4">
            <SearchForm className="md:hidden" onSearch={closeMenu} />
            <nav aria-label="Mobile" className="mt-2">
              <ul className="divide-y divide-stone-100">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={closeMenu}
                      aria-current={isActive(item) ? 'page' : undefined}
                      className={cn(
                        'block py-3 text-base font-medium',
                        item.label === 'Sale' ? 'text-red-600' : 'text-stone-800',
                        isActive(item) && 'text-brand-700',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Container>
        </div>
      )}
    </header>
  )
}

export default Header
