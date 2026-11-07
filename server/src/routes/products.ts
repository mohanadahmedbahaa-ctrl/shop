import { Router } from 'express'
import { requireAuth, requireRole } from '../auth.ts'
import { pool } from '../db.ts'
import type { Product } from '../types.ts'

// 1. A ROUTER is a mini-app for one group of URLs. index.ts mounts it at /api/products,
//    so here '/' means /api/products and '/:id' means /api/products/:id.
export const productsRouter = Router()

// 2. What a database row looks like. NUMERIC columns arrive as STRINGS ("39.99"), not numbers:
//    JavaScript numbers can't hold every exact decimal, so the `pg` library plays it safe.
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

// 3. The shared part of both queries. One product + ALL its images in one row:
//    - LEFT JOIN keeps products that have no images (a plain JOIN would drop them).
//    - array_agg(... ORDER BY position) collects the image rows into one array, in order.
//    - FILTER + COALESCE turn "no images" into [] instead of [null].
//    - LEFT JOIN users adds the seller's NAME (NULL for the store's own products).
//    GROUP BY p.id, u.id: each is a primary key, so Postgres knows every other column of
//    products and users has one value per group.
const SELECT_PRODUCTS = `
  SELECT p.id, p.title, p.description, p.category, p.price, p.compare_at_price,
         p.rating, p.review_count, p.stock, p.seller_id, u.name AS seller_name,
         COALESCE(array_agg(i.url ORDER BY i.position) FILTER (WHERE i.url IS NOT NULL), '{}') AS images
  FROM products p
  LEFT JOIN users u ON u.id = p.seller_id
  LEFT JOIN product_images i ON i.product_id = p.id
`

// 4. Translate a database row (snake_case, string numbers) into the API shape.
//    compareAtPrice is only added when the product is on sale, exactly like the frontend data.
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

// 2147483647 is the largest Postgres INTEGER; bigger would make the query itself crash.
function parseId(value: unknown): number | null {
  const id = Number(value) // URL params are strings, like in React Router
  return Number.isInteger(id) && id >= 1 && id <= 2147483647 ? id : null
}

// 5. GET /api/products            -> all products
//    GET /api/products?category=home -> only that category
//
//    SECURITY: the value goes in as a PARAMETER ($1), never glued into the SQL string.
//    `WHERE category = '${category}'` would let someone send  ?category=' OR 1=1 --
//    and change your query: that's SQL INJECTION, one of the most common real attacks.
//    With $1, Postgres treats the value as plain data, never as SQL.
productsRouter.get('/', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : null

  // ($1::text IS NULL OR ...) = "if no category was given, don't filter".
  const { rows } = await pool.query<ProductRow>(
    `${SELECT_PRODUCTS}
     WHERE ($1::text IS NULL OR p.category = $1)
     GROUP BY p.id, u.id
     ORDER BY p.id`,
    [category],
  )

  res.json(rows.map(toProduct))
})

// 6. GET /api/products/3 -> one product.
//    HTTP STATUS CODES tell the client what happened:
//    200 OK (default), 400 Bad Request (your input is wrong), 404 Not Found.
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

// ---------------------------------------------------------------- creating products

type NewProduct = {
  title: string
  description: string
  category: string
  price: number
  compareAtPrice: number | null
  stock: number
  images: string[]
}

// 7. VALIDATION returns either the clean data or an error message.
//    This shape ({ ok: true, ... } | { ok: false, ... }) is a DISCRIMINATED UNION:
//    after `if (!result.ok)`, TypeScript knows which fields exist.
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
  // Images: 1 to 8 web addresses. new URL() throws on anything that isn't a valid URL.
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
      // Round to cents: 19.999 -> 20.00 (NUMERIC(10,2) would round anyway, this is explicit)
      price: Math.round(price * 100) / 100,
      compareAtPrice: compareAtPrice == null ? null : Math.round(Number(compareAtPrice) * 100) / 100,
      stock,
      images: images as string[],
    },
  }
}

// 8. POST /api/products  -> 201 Created + the new product.
//    The middlewares run left to right: logged in? -> right role? -> handler.
//    Buyers get 403.
productsRouter.post('/', requireAuth, requireRole('seller', 'moderator', 'admin'), async (req, res) => {
  const result = validateProduct(req.body)
  if (!result.ok) {
    res.status(400).json({ error: result.error })
    return
  }
  const p = result.data

  // 9. A TRANSACTION: the product row and its image rows are saved together or not at all.
  //    A transaction needs ONE connection for all its queries, so we borrow a client from
  //    the pool (pool.query could use a different connection for each query).
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

    // unnest() turns two arrays into rows: one INSERT for all images instead of a loop.
    // WITH ORDINALITY numbers them 1, 2, 3...; minus 1 gives positions 0, 1, 2 (0 = main image).
    await client.query(
      `INSERT INTO product_images (product_id, position, url)
       SELECT $1, n - 1, url FROM unnest($2::text[]) WITH ORDINALITY AS t(url, n)`,
      [productId, p.images],
    )
    await client.query('COMMIT')

    res.status(201).json(await findProduct(productId))
  } catch (error) {
    await client.query('ROLLBACK') // undo everything from this transaction
    // 23503 = foreign key violation: the category doesn't exist in the categories table.
    if (error instanceof Error && 'code' in error && error.code === '23503') {
      res.status(400).json({ error: 'That category does not exist' })
      return
    }
    throw error
  } finally {
    // 10. ALWAYS give the client back to the pool, success or error.
    //     Forgetting this "leaks" connections until the pool is empty and the app hangs.
    client.release()
  }
})

// 11. DELETE /api/products/3  -> 204 No Content.
//     Who may delete what:
//       seller            -> only their OWN products (403 for others)
//       moderator, admin  -> any product
//     This is checked HERE, not with requireRole alone, because the answer depends on the data
//     (who owns this product?), not just on the role. That's called OWNERSHIP-based authorization.
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

  // product_images rows are removed automatically: ON DELETE CASCADE in schema.sql
  await pool.query('DELETE FROM products WHERE id = $1', [id])
  res.status(204).end()
})
