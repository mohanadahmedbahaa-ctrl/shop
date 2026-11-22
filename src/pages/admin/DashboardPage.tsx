import { AlertTriangle, ArrowRight, DollarSign, LoaderCircle, Package, ShoppingCart, Users } from 'lucide-react'
import { Link } from 'react-router'
import AdminOrdersTable from '../../components/orders/AdminOrdersTable'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import Container from '../../components/ui/Container'
import { roleLabels, type Role } from '../../context/AuthContext'
import { useApiData } from '../../hooks/useApiData'
import type { Order } from '../../types/order'
import { formatPrice } from '../../utils/formatPrice'

type Stats = {
  revenue: number
  orderCount: number
  openOrders: number
  productCount: number
  usersByRole: Partial<Record<Role, number>>
  lowStock: { id: number; title: string; stock: number }[]
  recentOrders: Order[]
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

function DashboardPage() {
  const { data: stats, status, error, reload, setData } = useApiData<Stats>('/api/admin/stats')

  if (status === 'loading') {
    return (
      <div role="status" className="flex justify-center py-32 text-stone-500">
        <LoaderCircle className="size-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading dashboard</span>
      </div>
    )
  }
  if (status === 'error' || !stats) {
    return (
      <Container className="py-24 text-center">
        <p className="text-red-700">{error}</p>
        <Button className="mt-6" onClick={reload}>
          Try again
        </Button>
      </Container>
    )
  }

  const userTotal = Object.values(stats.usersByRole).reduce((sum, n) => sum + (n ?? 0), 0)

  const tiles = [
    { label: 'Revenue', value: formatPrice(stats.revenue), note: 'excluding cancelled orders', icon: DollarSign },
    { label: 'Orders', value: stats.orderCount, note: `${stats.openOrders} waiting to ship`, icon: ShoppingCart },
    { label: 'Products', value: stats.productCount, note: `${stats.lowStock.length} low on stock`, icon: Package },
    { label: 'Users', value: userTotal, note: plural(stats.usersByRole.seller ?? 0, 'seller'), icon: Users },
  ]

  function handleOrderUpdated(updated: Order) {
    setData((prev) => prev && { ...prev, recentOrders: prev.recentOrders.map((o) => (o.id === updated.id ? updated : o)) })
    reload()
  }

  return (
    <Container className="py-10">
      <title>Admin dashboard · E-commerce</title>
      <Breadcrumbs items={[{ label: 'My account', to: '/account' }, { label: 'Admin dashboard' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <nav aria-label="Admin" className="flex flex-wrap gap-2 text-sm">
          {[
            { to: '/admin/orders', label: 'All orders' },
            { to: '/dashboard/products', label: 'Products' },
            { to: '/admin/users', label: 'Users' },
          ].map((link) => (
            <Link key={link.to} to={link.to} className="rounded-full px-4 py-2 font-medium ring-1 ring-inset ring-stone-300 hover:bg-stone-50">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-stone-200 p-5">
            <dt className="flex items-center gap-2 text-sm text-stone-500">
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums sm:text-3xl">{value}</dd>
            <dd className="mt-1 text-xs text-stone-500">{note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <section aria-labelledby="recent-orders" className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-orders" className="text-lg font-semibold">
              Recent orders
            </h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-stone-700 hover:text-stone-900">
              View all <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <AdminOrdersTable orders={stats.recentOrders} onOrderUpdated={handleOrderUpdated} />
        </section>

        <div className="space-y-10 lg:col-span-4">
          <section aria-labelledby="low-stock">
            <h2 id="low-stock" className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="size-5 text-amber-500" aria-hidden="true" />
              Low stock
            </h2>
            {stats.lowStock.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Every product has more than 10 in stock.</p>
            ) : (
              <ul className="mt-3 divide-y divide-stone-200 rounded-2xl border border-stone-200">
                {stats.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <Link to={`/product/${p.id}`} className="truncate hover:underline">
                      {p.title}
                    </Link>
                    <span className={`shrink-0 font-semibold tabular-nums ${p.stock === 0 ? 'text-red-600' : 'text-amber-700'}`}>
                      {p.stock === 0 ? 'Sold out' : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="users-by-role">
            <h2 id="users-by-role" className="text-lg font-semibold">
              Users by role
            </h2>
            <ul className="mt-3 space-y-3">
              {(Object.keys(roleLabels) as Role[]).map((role) => {
                const count = stats.usersByRole[role] ?? 0
                return (
                  <li key={role} className="text-sm">
                    <div className="flex justify-between">
                      <span>{roleLabels[role]}</span>
                      <span className="font-medium tabular-nums">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${userTotal ? (count / userTotal) * 100 : 0}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </Container>
  )
}

export default DashboardPage
