import { LayoutDashboard, LogOut, Package, PackagePlus, Receipt, Users } from 'lucide-react'
import { startTransition } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
import { canManageProducts, canModerate, isAdmin, roleLabels, useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'

function AccountPage() {
  const { user, logout } = useAuth()
  const { products } = useProducts()
  const navigate = useNavigate()
  if (!user) return null

  const myProductCount = products.filter((p) => p.sellerId === user.id).length
  const memberSince = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(user.createdAt))

  function handleLogout() {
    startTransition(() => {
      navigate('/')
      logout()
    })
  }

  const tools = [
    { show: true, to: '/account/orders', icon: Receipt, title: 'My orders', text: 'Track orders and see receipts' },
    {
      show: isAdmin(user),
      to: '/admin',
      icon: LayoutDashboard,
      title: 'Admin dashboard',
      text: 'Revenue, orders, low stock and users',
    },
    {
      show: canManageProducts(user),
      to: '/dashboard/products/new',
      icon: PackagePlus,
      title: 'Add a product',
      text: 'List a new product in the store',
    },
    {
      show: canManageProducts(user),
      to: '/dashboard/products',
      icon: Package,
      title: canModerate(user) ? 'Manage all products' : 'My products',
      text: canModerate(user) ? 'Review and remove any product in the catalog' : `${myProductCount} products listed`,
    },
    { show: isAdmin(user), to: '/admin/users', icon: Users, title: 'Manage users', text: 'Change roles: make sellers, moderators, admins' },
  ].filter((tool) => tool.show)

  return (
    <Container className="max-w-3xl py-12">
      <title>My account · E-commerce</title>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hi, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-stone-600">{user.email}</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </Button>
      </div>

      <dl className="mt-8 grid gap-4 rounded-2xl bg-stone-50 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-stone-500">Account type</dt>
          <dd className="mt-1">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">{roleLabels[user.role]}</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-stone-500">Member since</dt>
          <dd className="mt-1 font-medium">{memberSince}</dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Your tools</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {tools.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Link to={to} className="flex h-full gap-4 rounded-2xl border border-stone-200 p-5 transition hover:border-stone-400">
                <Icon className="size-6 shrink-0 text-brand-700" aria-hidden="true" />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-stone-500">{text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {user.role === 'buyer' && (
        <p className="mt-8 text-sm text-stone-600">
          Want to sell in this store? Ask an admin to make your account a seller account.{' '}
          <Link to="/shop" className="font-medium text-brand-700 hover:underline">
            Continue shopping
          </Link>
        </p>
      )}
    </Container>
  )
}

export default AccountPage
