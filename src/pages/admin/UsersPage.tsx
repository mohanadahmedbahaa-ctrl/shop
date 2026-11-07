import { LoaderCircle } from 'lucide-react'
import { useEffect, useState, type ChangeEvent } from 'react'
import { apiFetch } from '../../api/client'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Container from '../../components/ui/Container'
import { roleLabels, useAuth, type Role, type User } from '../../context/AuthContext'

const roles = Object.keys(roleLabels) as Role[]

// /admin/users (admin only): see every account and change its role.
// This is how moderators and admins are created: nobody can sign up as one.
function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // 1. Page-level data fetching: this list is only needed here, so it lives in local state
  //    (not in a context like the products). Same `ignore` pattern as ProductsProvider.
  useEffect(() => {
    let ignore = false
    apiFetch<User[]>('/api/users')
      .then((data) => {
        if (!ignore) {
          setUsers(data)
          setStatus('ready')
        }
      })
      .catch((err: Error) => {
        if (!ignore) {
          setMessage({ type: 'error', text: err.message })
          setStatus('error')
        }
      })
    return () => {
      ignore = true
    }
  }, [])

  // 2. PATCH the role, then replace that ONE user in the list with the server's answer.
  async function changeRole(target: User, event: ChangeEvent<HTMLSelectElement>) {
    const role = event.target.value as Role
    setMessage(null)
    try {
      const updated = await apiFetch<User>(`/api/users/${target.id}/role`, { method: 'PATCH', body: { role } })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setMessage({ type: 'success', text: `${updated.name} is now ${roleLabels[updated.role].toLowerCase()}.` })
    } catch (err) {
      // The <select> is controlled by `users`, which didn't change, so it snaps back on failure.
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Could not change the role' })
    }
  }

  return (
    <Container className="py-10">
      <title>Manage users · Oakline</title>
      <Breadcrumbs items={[{ label: 'My account', to: '/account' }, { label: 'Manage users' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Manage users</h1>
      <p className="mt-1 text-stone-600">
        Sellers can add products. Moderators can remove any product. Admins can also change roles.
      </p>

      {/* aria-live: the success/error text is announced when it changes */}
      <div aria-live="polite" className="mt-6">
        {message && (
          <p className={`rounded-lg px-4 py-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {message.text}
          </p>
        )}
      </div>

      {status === 'loading' && (
        <div role="status" className="flex justify-center py-16 text-stone-500">
          <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading users</span>
        </div>
      )}

      {status === 'ready' && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full min-w-xl text-left text-sm">
            <caption className="sr-only">{users.length} users</caption>
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">
                    {u.name} {u.id === me?.id && <span className="text-stone-400">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{u.email}</td>
                  <td className="px-4 py-3 text-stone-600">{new Date(u.createdAt).toLocaleDateString('en-US')}</td>
                  <td className="px-4 py-3">
                    {/* Disabled for yourself: the server refuses it too (you could lock yourself out). */}
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e)}
                      disabled={u.id === me?.id}
                      aria-label={`Role for ${u.name}`}
                      className="h-9 rounded-full border border-stone-300 bg-white pl-3 pr-8 text-sm outline-none focus:border-stone-500 disabled:bg-stone-50 disabled:text-stone-500"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {roleLabels[r]}
                        </option>
                      ))}
                    </select>
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

export default UsersPage
