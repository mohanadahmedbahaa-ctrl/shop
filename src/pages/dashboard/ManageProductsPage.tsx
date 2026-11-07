import { PackagePlus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { apiFetch } from '../../api/client'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { buttonStyles } from '../../components/ui/buttonStyles'
import Container from '../../components/ui/Container'
import { canModerate, useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductsContext'
import { categoryInfo, type Product } from '../../data/products'
import { formatPrice } from '../../utils/formatPrice'

function ManageProductsPage() {
  const { user } = useAuth()
  const { products, removeProductFromList } = useProducts()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  if (!user) return null

  const moderator = canModerate(user)
  const visible = moderator ? products : products.filter((p) => p.sellerId === user.id)

  const canDelete = (p: Product) => moderator || p.sellerId === user.id

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete "${product.title}"? This can't be undone.`)) return
    setError(null)
    setDeletingId(product.id)
    try {
      await apiFetch(`/api/products/${product.id}`, { method: 'DELETE' })
      removeProductFromList(product.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the product')
    } finally {
      setDeletingId(null)
    }
  }

  const sellerLabel = (p: Product) => (p.sellerId === null ? 'Oakline' : p.sellerId === user.id ? 'You' : (p.sellerName ?? 'Unknown'))

  return (
    <Container className="py-10">
      <title>{moderator ? 'Manage products' : 'My products'} · Oakline</title>
      <Breadcrumbs items={[{ label: 'My account', to: '/account' }, { label: moderator ? 'Manage products' : 'My products' }]} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{moderator ? 'Manage products' : 'My products'}</h1>
          <p className="mt-1 text-stone-600">
            {moderator ? 'As a moderator you can remove any product from the store.' : 'Products you listed on Oakline.'}
          </p>
        </div>
        <Link to="/dashboard/products/new" className={buttonStyles('primary', 'md')}>
          <PackagePlus className="size-4" aria-hidden="true" />
          Add product
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-stone-50 px-6 py-16 text-center">
          <p className="font-medium">You haven't listed any products yet</p>
          <Link to="/dashboard/products/new" className={buttonStyles('primary', 'md', 'mt-6')}>
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full min-w-2xl text-left text-sm">
            <caption className="sr-only">{visible.length} products</caption>
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Product</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Price</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                {moderator && <th scope="col" className="px-4 py-3 font-medium">Seller</th>}
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {visible.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link to={`/product/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <img src={p.images[0]} alt="" className="size-12 shrink-0 rounded-lg bg-stone-100 object-contain p-1 mix-blend-multiply" />
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{categoryInfo[p.category]?.name ?? p.category}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                  {moderator && <td className="px-4 py-3 text-stone-600">{sellerLabel(p)}</td>}
                  <td className="px-4 py-3 text-right">
                    {canDelete(p) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        aria-label={`Delete ${p.title}`}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        {deletingId === p.id ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}

export default ManageProductsPage
