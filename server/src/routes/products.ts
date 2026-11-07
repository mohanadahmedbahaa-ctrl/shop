import { Router } from 'express'
import { requireAuth, requireRole } from '../auth.ts'
import { pool } from '../db.ts'
import type { Product } from '../types.ts'

export const productsRouter = Router()

type ProductRow = {
  id: number
  title: string
  description: string
  category: string
  price: string
  compare_at_price: string | null
  rating: string
  review_count: number
  stock: number
  images: string[]
  seller_id: number | null
  seller_name: string | null
}

const SELECT_PRODUCTS = `
  SELECT p.id, p.title, p.description, p.category, p.price, p.compare_at_price,
         p.rating, p.review_count, p.stock, p.seller_id, u.name AS seller_name,
         COALESCE(array_agg(i.url ORDER BY i.position) FILTER (WHERE i.url IS NOT NULL), '{}') AS images
  FROM products p
  LEFT JOIN users u ON u.id = p.seller_id
  LEFT JOIN product_images i ON i.product_id = p.id
`

function toProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    images: row.images,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
  }
  if (row.compare_at_price !== null) {
    product.compareAtPrice = Number(row.compare_at_price)
  }
  return product
}

async function findProduct(id: number): Promise<Product | null> {
  const { rows } = await pool.query<ProductRow>(
    `${SELECT_PRODUCTS}
     WHERE p.id = $1
     GROUP BY p.id, u.id`,
    [id],
  )
  return rows[0] ? toProduct(rows[0]) : null
}

function parseId(value: unknown): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id >= 1 && id <= 2147483647 ? id : null
}

productsRouter.get('/', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : null

  const { rows } = await pool.query<ProductRow>(
    `${SELECT_PRODUCTS}
     WHERE ($1::text IS NULL OR p.category = $1)
     GROUP BY p.id, u.id
     ORDER BY p.id`,
    [category],
  )

  res.json(rows.map(toProduct))
})

productsRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Product id must be a positive whole number' })
    return
  }

  const product = await findProduct(id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json(product)
})

type NewProduct = {
  title: string
  description: string
  category: string
  price: number
  compareAtPrice: number | null
  stock: number
  images: string[]
}

type Validation = { ok: true; data: NewProduct } | { ok: false; error: string }

function validateProduct(body: unknown): Validation {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'Send the product as JSON' }
  const b = body as Record<string, unknown>

  const title = typeof b.title === 'string' ? b.title.trim() : ''
  const description = typeof b.description === 'string' ? b.description.trim() : ''
  const category = typeof b.category === 'string' ? b.category : ''
  const { price, compareAtPrice, stock, images } = b

  if (!title || title.length > 120) return { ok: false, error: 'Title is required (max 120 characters)' }
  if (!description || description.length > 2000) return { ok: false, error: 'Description is required (max 2000 characters)' }
  if (!category) return { ok: false, error: 'Choose a category' }
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || price > 99_999_999) {
    return { ok: false, error: 'Price must be a positive number' }
  }
  if (compareAtPrice != null && (typeof compareAtPrice !== 'number' || compareAtPrice <= price)) {
    return { ok: false, error: 'The "compare at" price must be higher than the price (or empty)' }
  }
  if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0 || stock > 1_000_000) {
    return { ok: false, error: 'Stock must be a whole number, 0 or more' }
  }
  if (!Array.isArray(images) || images.length < 1 || images.length > 8) {
    return { ok: false, error: 'Add between 1 and 8 image URLs' }
  }
  for (const url of images) {
    try {
      if (typeof url !== 'string' || !['http:', 'https:'].includes(new URL(url).protocol)) throw new Error()
    } catch {
      return { ok: false, error: `Not a valid image URL: ${String(url)}` }
    }
  }

  return {
    ok: true,
    data: {
      title,
      description,
      category,
      price: Math.round(price * 100) / 100,
      compareAtPrice: compareAtPrice == null ? null : Math.round(Number(compareAtPrice) * 100) / 100,
      stock,
      images: images as string[],
    },
  }
}

productsRouter.post('/', requireAuth, requireRole('seller', 'moderator', 'admin'), async (req, res) => {
  const result = validateProduct(req.body)
  if (!result.ok) {
    res.status(400).json({ error: result.error })
    return
  }
  const p = result.data

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO products (title, description, category, price, compare_at_price, stock, seller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [p.title, p.description, p.category, p.price, p.compareAtPrice, p.stock, req.user!.id],
    )
    const productId = rows[0]!.id

    await client.query(
      `INSERT INTO product_images (product_id, position, url)
       SELECT $1, n - 1, url FROM unnest($2::text[]) WITH ORDINALITY AS t(url, n)`,
      [productId, p.images],
    )
    await client.query('COMMIT')

    res.status(201).json(await findProduct(productId))
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      res.status(400).json({ error: 'That category does not exist' })
      return
    }
    throw error
  } finally {
    client.release()
  }
})

productsRouter.delete('/:id', requireAuth, requireRole('seller', 'moderator', 'admin'), async (req, res) => {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Product id must be a positive whole number' })
    return
  }

  const { rows } = await pool.query<{ seller_id: number | null }>('SELECT seller_id FROM products WHERE id = $1', [id])
  const row = rows[0]
  if (!row) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const user = req.user!
  if (user.role === 'seller' && row.seller_id !== user.id) {
    res.status(403).json({ error: 'You can only delete your own products' })
    return
  }

  await pool.query('DELETE FROM products WHERE id = $1', [id])
  res.status(204).end()
})
