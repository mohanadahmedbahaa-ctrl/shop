import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from './db.ts'
import type { PublicUser, Role } from './types.ts'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Add it to server/.env (see .env.example).')
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function checkPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, JWT_SECRET!, { expiresIn: '7d' })
}

export type UserRow = {
  id: number
  name: string
  email: string
  role: Role
  password_hash: string
  created_at: Date
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Please log in' })
    return
  }

  let userId: number
  try {
    const payload = jwt.verify(token, JWT_SECRET!)
    userId = Number(typeof payload === 'object' ? payload.sub : NaN)
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please log in again.' })
    return
  }

  const { rows } = await pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [userId])
  const row = rows[0]
  if (!row) {
    res.status(401).json({ error: 'Account not found. Please log in again.' })
    return
  }

  req.user = toPublicUser(row)
  next()
}

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      res.status(403).json({ error: 'You do not have permission to do that' })
      return
    }
    next()
  }
}
