// ADMIN ONLY: list users and change their roles.
import { Router } from 'express'
import { requireAuth, requireRole, toPublicUser, type UserRow } from '../auth.ts'
import { pool } from '../db.ts'
import { ROLES, type Role } from '../types.ts'

export const usersRouter = Router()

// 1. router.use() applies these middlewares to EVERY route in this file:
//    first "are you logged in?", then "are you an admin?". Written once, can't be forgotten.
usersRouter.use(requireAuth, requireRole('admin'))

// 2. A type guard, like in the frontend's productFilters.ts.
//    ROLES is a readonly tuple, so we compare with .some() instead of .includes().
function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value)
}

// GET /api/users -> all users, newest first
usersRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users ORDER BY created_at DESC')
  res.json(rows.map(toPublicUser)) // toPublicUser drops the password hashes
})

// 3. PATCH /api/users/5/role   body: { role: 'moderator' }
//    PATCH = change PART of a resource (PUT would mean "replace the whole user").
usersRouter.patch('/:id/role', async (req, res) => {
  const id = Number(req.params.id)
  const role: unknown = req.body?.role

  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    res.status(400).json({ error: 'Invalid user id' })
    return
  }
  if (!isRole(role)) {
    res.status(400).json({ error: `Role must be one of: ${ROLES.join(', ')}` })
    return
  }
  // 4. Safety rule: an admin can't change their OWN role. Otherwise the last admin could
  //    demote themselves by accident and nobody could manage roles anymore.
  if (id === req.user!.id) {
    res.status(400).json({ error: "You can't change your own role" })
    return
  }

  const { rows } = await pool.query<UserRow>('UPDATE users SET role = $1 WHERE id = $2 RETURNING *', [role, id])
  const row = rows[0]
  if (!row) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(toPublicUser(row))
})
