import { Router } from 'express'
import { pool } from '../db.ts'
import type { Category } from '../types.ts'

export const categoriesRouter = Router()

categoriesRouter.get('/', async (_req, res) => {
  const { rows } = await pool.query<Category>('SELECT slug, name, tagline FROM categories ORDER BY position')
  res.json(rows)
})
