// THE CART OF A LOGGED-IN USER. Every route answers with the WHOLE cart, so the React app
// can simply replace its state with the server's version (the server is the source of truth).
import { Router } from 'express'
import { requireAuth } from '../auth.ts'
import { pool } from '../db.ts'
import { HttpError, isId } from '../errors.ts'

export const cartRouter = Router()
cartRouter.use(requireAuth) // every cart route needs a login: the cart belongs to req.user

type CartLine = { productId: number; quantity: number }

// 1. One helper used by every route. `AS "productId"` (with quotes) keeps the camelCase name
//    exactly; without quotes Postgres would lowercase it to productid.
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

// GET /api/cart -> [{ productId, quantity }, ...]
cartRouter.get('/', async (req, res) => {
  res.json(await getCart(req.user!.id))
})

// 2. PUT /api/cart/:productId  body: { quantity: 3 }  -> sets that line to 3 (creates it if needed).
//    PUT is IDEMPOTENT: sending the same request twice gives the same result (quantity 3),
//    unlike "add 1", which would give 4 then 5. Safer if the network retries a request.
cartRouter.put('/:productId', async (req, res) => {
  const productId = Number(req.params.productId)
  if (!isId(productId)) throw new HttpError(400, 'Invalid product id')
  const quantity = readQuantity(req.body?.quantity)

  const { rows } = await pool.query<{ stock: number }>('SELECT stock FROM products WHERE id = $1', [productId])
  const product = rows[0]
  if (!product) throw new HttpError(404, 'Product not found')
  if (product.stock === 0) throw new HttpError(409, 'This product is out of stock')

  // 3. UPSERT = INSERT, or UPDATE if the row already exists.
  //    ON CONFLICT (user_id, product_id) uses the composite primary key from schema.sql.
  //    EXCLUDED = the row we TRIED to insert. Math.min caps the quantity at the stock.
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
    [req.user!.id, productId, Math.min(quantity, product.stock)],
  )
  res.json(await getCart(req.user!.id))
})

// DELETE /api/cart/:productId -> remove one line
cartRouter.delete('/:productId', async (req, res) => {
  const productId = Number(req.params.productId)
  if (!isId(productId)) throw new HttpError(400, 'Invalid product id')
  await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user!.id, productId])
  res.json(await getCart(req.user!.id))
})

// DELETE /api/cart -> empty the whole cart
cartRouter.delete('/', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user!.id])
  res.json([])
})

// 4. POST /api/cart/merge  body: { items: [{ productId, quantity }, ...] }
//    At LOGIN the React app sends the cart the user filled as a guest. It's ADDED to whatever
//    is already saved on their account (e.g. from their phone), capped at the stock.
cartRouter.post('/merge', async (req, res) => {
  const items: unknown = req.body?.items
  if (!Array.isArray(items) || items.length > 100) throw new HttpError(400, 'items must be a list')

  // Combine duplicates first ({3, qty 1} + {3, qty 2} -> {3, qty 3}). One INSERT can't touch
  // the same row twice, Postgres would refuse with "cannot affect row a second time".
  const merged = new Map<number, number>()
  for (const item of items) {
    if (!isId(item?.productId)) continue // skip junk instead of failing the whole login
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + readQuantity(item.quantity))
  }

  if (merged.size > 0) {
    // 5. unnest() turns two arrays into rows (productId, quantity). JOIN products drops ids that
    //    don't exist and gives us the stock. LEAST() = the smaller value (SQL's Math.min).
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
