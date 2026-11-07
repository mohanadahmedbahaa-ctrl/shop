// <Link> and <NavLink> replace <a href> inside a React Router app.
// They change the URL WITHOUT reloading the page (that's what a "single-page app" means),
// so state like the cart survives navigation.
import { Link, NavLink } from 'react-router'
import { useCart } from '../context/CartContext'

function Navbar() {
  // Read just what we need from the cart context.
  const { totalItems } = useCart()

  // NavLink can take a FUNCTION for className. It receives { isActive },
  // which is true when the link matches the current URL, so we can highlight it.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'

  return (
    // sticky top-0 z-10 = stays at the top while scrolling, above the page content
    <header className="sticky top-0 z-10 bg-white shadow">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          My Shop
        </Link>

        <div className="flex items-center gap-6">
          {/* `end` = only "active" on exactly "/", not on every page that starts with "/" */}
          <NavLink to="/" end className={linkClass}>
            Products
          </NavLink>

          <NavLink to="/cart" className={linkClass}>
            {/* relative here + absolute on the badge = badge positioned on the corner */}
            <span className="relative">
              Cart
              {/* CONDITIONAL RENDERING with &&: if the left side is false, React renders nothing.
                  Careful: `0 && ...` would render "0", which is why we compare with > 0. */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-5 bg-blue-600 text-white text-xs rounded-full px-1.5">
                  {totalItems}
                </span>
              )}
            </span>
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
