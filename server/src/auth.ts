// Everything about AUTHENTICATION (who are you?) and AUTHORIZATION (what may you do?).
import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from './db.ts'
import type { PublicUser, Role } from './types.ts'

// 1. The secret that SIGNS tokens. Anyone who knows it can create a token for any user
//    (even an admin), so it lives in .env, never in the code. Fail fast if it's missing.
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Add it to server/.env (see .env.example).')
}

// ---------------------------------------------------------------- passwords

// 2. HASHING with bcrypt. A hash is one-way: you can't turn it back into the password.
//    bcrypt adds a random SALT (so two users with the same password get different hashes)
//    and is deliberately SLOW (cost 10 = 2^10 rounds), which makes guessing millions
//    of passwords impractical if the database ever leaks.
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ---------------------------------------------------------------- tokens

// 3. A JWT (JSON Web Token) is a signed note: "this is user 5", plus an expiry date.
//    The server gives it out at login; the browser sends it back on every request in
//    the header  Authorization: Bearer <token>.
//    The SIGNATURE means nobody can edit the note (e.g. change 5 to 1) without the secret.
//    It's NOT encrypted: anyone can read it, so never put secrets in it. We only store the id.
export function createToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET!, { expiresIn: '7d' })
}

// ---------------------------------------------------------------- database row -> API shape

export type UserRow = {
  id: number
  name: string
  email: string
  role: Role
  password_hash: string
  created_at: Date
}

// Picks only the safe fields: the password hash is dropped here.
export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  }
}

// ---------------------------------------------------------------- middleware

// 4. MIDDLEWARE that protects a route. Put it before a route handler:
//      router.post('/', requireAuth, handler)
//    It checks the token and loads the user, then calls next() to continue.
//    If anything is wrong it answers 401 Unauthorized and the handler never runs.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // "Bearer eyJhbGciOi..." -> "eyJhbGciOi..."
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Please log in' })
    return
  }

  let userId: number
  try {
    // verify() checks the signature AND the expiry date; it throws if either fails.
    const payload = jwt.verify(token, JWT_SECRET!)
    userId = Number(typeof payload === 'object' ? payload.sub : NaN)
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' })
    return
  }

  // 5. Load the user FRESH from the database on every request, instead of trusting a role
  //    stored inside the token. So when an admin changes someone's role (or deletes them),
  //    it takes effect immediately, not when their 7-day token expires.
  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId])
  const row = rows[0]
  if (!row) {
    res.status(401).json({ error: 'Account not found. Please log in again.' })
    return
  }

  req.user = toPublicUser(row)
  next()
}

// 6. AUTHORIZATION: a function that RETURNS a middleware (a "middleware factory").
//      router.post('/', requireAuth, requireRole('seller', 'admin'), handler)
//    401 = "I don't know who you are"; 403 Forbidden = "I know who you are, but you may not".
export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to do that' })
      return
    }
    next()
  }
}
