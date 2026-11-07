import { Router } from 'express'
import { checkPassword, createToken, hashPassword, requireAuth, toPublicUser, type UserRow } from '../auth.ts'
import { pool } from '../db.ts'

export const authRouter = Router()

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

// 1. Helper: req.body is UNTRUSTED (anyone can send anything with curl or Postman).
//    Never assume a field exists or is a string; check it.
function readString(body: unknown, key: string): string {
  if (typeof body !== 'object' || body === null) return ''
  const value = (body as Record<string, unknown>)[key]
  return typeof value === 'string' ? value.trim() : ''
}

// 2. POST /api/auth/signup   body: { name, email, password, accountType: 'buyer' | 'seller' }
//    -> 201 Created + { token, user }
authRouter.post('/signup', async (req, res) => {
  const name = readString(req.body, 'name')
  const email = readString(req.body, 'email').toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : '' // not trimmed: spaces are allowed in passwords
  const accountType = readString(req.body, 'accountType') || 'buyer'

  // 3. SERVER-SIDE VALIDATION. The React form validates too, but that's only for a nice UX:
  //    anyone can skip the frontend and call the API directly.
  if (!name || name.length > 60) {
    res.status(400).json({ error: 'Enter your name (max 60 characters)' })
    return
  }
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: 'Enter a valid email address' })
    return
  }
  if (password.length < 8 || password.length > 72) {
    // 72 = bcrypt only uses the first 72 bytes of a password
    res.status(400).json({ error: 'Password must be 8 to 72 characters' })
    return
  }
  // 4. SECURITY: people may only sign up as buyer or seller. If we accepted any role from
  //    the request body, anyone could send { "accountType": "admin" } and take over the store.
  //    Moderators and admins are only created by an admin (see routes/users.ts).
  if (accountType !== 'buyer' && accountType !== 'seller') {
    res.status(400).json({ error: 'Account type must be buyer or seller' })
    return
  }

  const passwordHash = await hashPassword(password)

  try {
    // RETURNING * = give back the row that was just inserted (with its new id).
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, passwordHash, accountType],
    )
    const user = toPublicUser(rows[0]!)
    res.status(201).json({ token: createToken(user.id), user })
  } catch (error) {
    // 5. Let the DATABASE enforce uniqueness (the UNIQUE constraint), then translate its error.
    //    Checking "does this email exist?" first and then inserting has a RACE CONDITION:
    //    two signups at the same moment could both pass the check.
    //    23505 = Postgres error code for "unique violation". 409 Conflict = already exists.
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
    }
    throw error // anything else -> the error handler in index.ts (500)
  }
})

// 6. POST /api/auth/login   body: { email, password }  -> { token, user }
authRouter.post('/login', async (req, res) => {
  const email = readString(req.body, 'email').toLowerCase()
  const password = typeof req.body?.password === 'string' ? req.body.password : ''

  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email])
  const row = rows[0]

  // 7. The SAME message whether the email or the password is wrong. A different message
  //    ("no account with this email") would let attackers find out who has an account.
  if (!row || !(await checkPassword(password, row.password_hash))) {
    res.status(401).json({ error: 'Wrong email or password' })
    return
  }

  const user = toPublicUser(row)
  res.json({ token: createToken(user.id), user })
})

// 8. GET /api/auth/me  -> the logged-in user.
//    The React app calls this when it starts, to check that a saved token is still valid.
authRouter.get('/me', requireAuth, (req, res) => {
  res.json(req.user)
})
