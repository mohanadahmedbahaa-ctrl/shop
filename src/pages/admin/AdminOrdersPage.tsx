import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import AdminOrdersTable from '../../components/orders/AdminOrdersTable'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import Container from '../../components/ui/Container'
import { useApiData } from '../../hooks/useApiData'
import { orderStatusLabels, type Order, type OrderStatus } from '../../types/order'
import { cn } from '../../utils/cn'

type Filter = 'all' | OrderStatus

function AdminOrdersPage() {
  const { data: orders, status, error, reload, setData } = useApiData<Order[]>('/api/orders')
  const [filter, setFilter] = useState<Filter>('all')

  const all = orders ?? []
  const visible = filter === 'all' ? all : all.filter((o) => o.status === filter)
  const countFor = (f: Filter) => (f === 'all' ? all.length : all.filter((o) => o.status === f).length)
  const filters: Filter[] = ['all', ...(Object.keys(orderStatusLabels) as OrderStatus[])]

  return (
    <Container className="py-10">
      <title>All orders · Oakline</title>
      <Breadcrumbs items={[{ label: 'Dashboard', to: '/admin' }, { label: 'All orders' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">All orders</h1>

      {status === 'loading' && (
        <div role="status" className="flex justify-center py-20 text-stone-500">
          <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading orders</span>
        </div>
      )}
      {status === 'error' && (
        <div className="mt-8 text-sm text-red-700">
          {error}
          <Button variant="secondary" size="sm" className="ml-4" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-inset',
                  filter === f ? 'bg-stone-900 text-white ring-stone-900' : 'ring-stone-300 hover:bg-stone-50',
                )}
              >
                {f === 'all' ? 'All' : orderStatusLabels[f]} <span className="opacity-60">{countFor(f)}</span>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <AdminOrdersTable
              orders={visible}
              onOrderUpdated={(updated) => setData((prev) => prev && prev.map((o) => (o.id === updated.id ? updated : o)))}
            />
          </div>
        </>
      )}
    </Container>
  )
}

export default AdminOrdersPage
