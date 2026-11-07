import { Router } from 'express'
import { requireAuth, requireRole, toPublicUser, type UserRow } from '../auth.ts'
import { pool } from '../db.ts'
import { ROLES, type Role } from '../types.ts'

export const usersRouter = Router()

usersRouter.use(requireAuth, requireRole('admin'))

function isRole(value: unknown): value is Role {
  return ROLES.some((role) => role === value)
}

usersRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<UserRow>('SELECT * FROM users ORDER BY created_at DESC')
  res.json(rows.map(toPublicUser))
})

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
