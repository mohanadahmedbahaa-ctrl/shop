import { Router } from 'express'
import { checkPassword, createToken, hashPassword, requireAuth, toPublicUser, type UserRow } from '../auth.ts'
import { pool } from '../db.ts'

export const authRouter = Router()

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

function readString(body: unknown, key: string): string {
  if (typeof body !== 'object' || body === null) return ''
  const value = (body as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() : ''
}

authRouter.post('/signup', async (req, res) => {
  const name = readString(req.body, 'name')
  const email = readString(req.body, 'email').toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  const accountType = readString(req.body, 'accountType') || 'buyer'

  if (!name || name.length > 60) {
    res.status(400).json({ error: 'Enter your name (max 60 characters)' })
    return
  }
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }
  if (password.length < 8 || password.length > 72) {
    res.status(400).json({ error: 'Password must be 8 to 72 characters' })
    return
  }
  if (accountType !== 'buyer' && accountType !== 'seller') {
    res.status(400).json({ error: 'Account type must be buyer or seller' })
    return
  }

  const passwordHash = await hashPassword(password)

  try {
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, passwordHash, accountType],
    )
    const user = toPublicUser(rows[0]!)
    res.status(201).json({ token: createToken(user.id), user })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }
    throw error
  }
})

authRouter.post('/login', async (req, res) => {
  const email = readString(req.body, 'email').toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email])
  const row = rows[0]

  if (!row || !(await checkPassword(password, row.password_hash))) {
    res.status(401).json({ error: 'Wrong email or password' })
    return
  }

  const user = toPublicUser(row)
  res.json({ token: createToken(user.id), user })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user)
})
