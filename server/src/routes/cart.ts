import { Router } from 'express'
import { requireAuth } from '../auth.ts'
import { pool } from '../db.ts'
import { HttpError, isId } from '../errors.ts'

export const cartRouter = Router()
cartRouter.use(requireAuth)

type CartLine = { productId: number; quantity: number }

async function getCart(userId: number): Promise<CartLine[]> {
  const { rows } = await pool.query<CartLine>(
    `SELECT product_id AS "productId", quantity
     FROM cart_items
     WHERE user_id = $1
     ORDER BY added_at, product_id`,
    [userId],
  )
  return rows
}

function readQuantity(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 999) {
    throw new HttpError(400, 'Quantity must be a whole number from 1 to 999')
  }
  return value
}

cartRouter.get('/', async (req, res) => {
  res.json(await getCart(req.user!.id))
})

cartRouter.put('/:productId', async (req, res) => {
  const productId = Number(req.params.productId)
  if (!isId(productId)) throw new HttpError(400, 'Invalid product id')
  const quantity = readQuantity(req.body?.quantity)

  const { rows } = await pool.query<{ stock: number }>('SELECT stock FROM products WHERE id = $1', [productId])
  const product = rows[0]
  if (!product) throw new HttpError(404, 'Product not found')
  if (product.stock === 0) throw new HttpError(409, 'This product is out of stock')

  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
    [req.user!.id, productId, Math.min(quantity, product.stock)],
  )
  res.json(await getCart(req.user!.id))
})

cartRouter.delete('/:productId', async (req, res) => {
  const productId = Number(req.params.productId)
  if (!isId(productId)) throw new HttpError(400, 'Invalid product id')
  await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user!.id, productId])
  res.json(await getCart(req.user!.id))
})

cartRouter.delete('/', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user!.id])
  res.json([])
})

cartRouter.post('/merge', async (req, res) => {
  const items: unknown = req.body?.items
  if (!Array.isArray(items) || items.length > 100) throw new HttpError(400, 'items must be a list')

  const merged = new Map<number, number>()
  for (const item of items) {
    if (!isId(item?.productId)) continue
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + readQuantity(item.quantity))
  }

  if (merged.size > 0) {
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       SELECT $1, p.id, LEAST(t.quantity, p.stock)
       FROM unnest($2::int[], $3::int[]) AS t(product_id, quantity)
       JOIN products p ON p.id = t.product_id
       WHERE p.stock > 0
       ON CONFLICT (user_id, product_id) DO UPDATE
         SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity,
                              (SELECT stock FROM products WHERE id = EXCLUDED.product_id))`,
      [req.user!.id, [...merged.keys()], [...merged.values()]],
    )
  }
  res.json(await getCart(req.user!.id))
})
