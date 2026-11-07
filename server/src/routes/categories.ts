import { Router } from 'express'
import { pool } from '../db.ts'
import type { Category } from '../types.ts'

export const categoriesRouter = Router()

// GET /api/categories -> replaces `categoryInfo` in the frontend.
// ORDER BY position: SQL returns rows in NO guaranteed order unless you ask for one.
categoriesRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<Category>('SELECT slug, name, tagline FROM categories ORDER BY position')
  res.json(rows)
})
