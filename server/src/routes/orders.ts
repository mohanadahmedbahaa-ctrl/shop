import { Router } from 'express'
import { requireAuth, requireRole } from '../auth.ts'
import { pool } from '../db.ts'
import { HttpError, isId } from '../errors.ts'
import { computeTotalsCents, SHIPPING_METHODS, toCents, toDollars, type ShippingMethod } from '../pricing.ts'
import { ORDER_STATUSES, type Order, type OrderItem, type OrderStatus } from '../types.ts'

export const ordersRouter = Router()

// ---------------------------------------------------------------- reading orders

type OrderRow = {
  id: number
  user_id: number | null
  customer_name: string | null
  email: string
  first_name: string
  last_name: string
  address: string
  apartment: string
  city: string
  postal_code: string
  country: string
  shipping_method: ShippingMethod
  subtotal: string
  shipping: string
  tax: string
  total: string
  status: OrderStatus
  created_at: Date
  items: OrderItem[]
}

// 1. Orders WITH their items in ONE query.
//    json_build_object() builds a JSON object per item row; json_agg() collects them into a
//    JSON array per order, so each result row is a complete order. (Same idea as array_agg
//    for product images, but with objects.) The `pg` library turns the JSON into JS objects.
//    `where` and `limit` are only ever FIXED strings written in this file, never user input,
//    so building the SQL with them is safe; the VALUES still go in as $1 parameters.
export async function fetchOrders(where: string, params: unknown[], limit?: number): Promise<Order[]> {
  const { rows } = await pool.query<OrderRow>(
    `SELECT o.*, u.name AS customer_name,
            COALESCE(
              json_agg(json_build_object(
                'productId', oi.product_id, 'title', oi.title, 'image', oi.image,
                'unitPrice', oi.unit_price, 'quantity', oi.quantity
              ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${where}
     GROUP BY o.id, u.id
     ORDER BY o.created_at DESC, o.id DESC
     ${limit ? `LIMIT ${Number(limit)}` : ''}`,
    params,
  )
  return rows.map(toOrder)
}

// Database row (snake_case, NUMERIC as strings) -> the API shape (camelCase, numbers).
function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: `OAK-${row.id}`,
    userId: row.user_id,
    customerName: row.customer_name,
    email: row.email,
    shippingAddress: {
      firstName: row.first_name,
      lastName: row.last_name,
      address: row.address,
      apartment: row.apartment,
      city: row.city,
      postalCode: row.postal_code,
      country: row.country,
    },
    shippingMethod: row.shipping_method,
    items: row.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
    totals: {
      subtotal: Number(row.subtotal),
      shipping: Number(row.shipping),
      tax: Number(row.tax),
      total: Number(row.total),
    },
    status: row.status,
    placedAt: row.created_at.toISOString(),
  }
}

// ---------------------------------------------------------------- validating a new order

type OrderInput = {
  email: string
  address: Order['shippingAddress'] // "the type of the shippingAddress field of Order"
  shippingMethod: ShippingMethod
  items: Map<number, number> // productId -> quantity
}

function text(value: unknown, field: string, { required = true, max = 120 } = {}): string {
  const s = typeof value === 'string' ? value.trim() : ''
  if (required && !s) throw new HttpError(400, `${field} is required`)
  if (s.length > max) throw new HttpError(400, `${field} is too long`)
  return s
}

function readOrderInput(body: unknown): OrderInput {
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'Send the order as JSON')
  const b = body as Record<string, unknown>
  const a = (typeof b.shippingAddress === 'object' && b.shippingAddress !== null ? b.shippingAddress : {}) as Record<string, unknown>

  const email = text(b.email, 'Email').toLowerCase()
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, 'Enter a valid email address')

  const shippingMethod = b.shippingMethod
  if (!SHIPPING_METHODS.some((m) => m === shippingMethod)) throw new HttpError(400, 'Choose a delivery method')

  // 2. The client sends ONLY product ids and quantities. Never prices: we look those up.
  if (!Array.isArray(b.items) || b.items.length === 0) throw new HttpError(400, 'Your cart is empty')
  if (b.items.length > 50) throw new HttpError(400, 'Too many different products in one order')
  const items = new Map<number, number>()
  for (const item of b.items) {
    const quantity = item?.quantity
    if (!isId(item?.productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      throw new HttpError(400, 'Every item needs a product id and a quantity from 1 to 999')
    }
    items.set(item.productId, (items.get(item.productId) ?? 0) + quantity)
  }

  return {
    email,
    shippingMethod: shippingMethod as ShippingMethod,
    items,
    address: {
      firstName: text(a.firstName, 'First name', { max: 60 }),
      lastName: text(a.lastName, 'Last name', { max: 60 }),
      address: text(a.address, 'Address', { max: 200 }),
      apartment: text(a.apartment, 'Apartment', { required: false, max: 100 }),
      city: text(a.city, 'City', { max: 100 }),
      postalCode: text(a.postalCode, 'Postal code', { max: 20 }),
      country: text(a.country, 'Country', { max: 60 }),
    },
  }
}

// ---------------------------------------------------------------- routes

// 3. POST /api/orders  -> 201 + the saved order.  Any logged-in user can buy.
ordersRouter.post('/', requireAuth, async (req, res) => {
  const input = readOrderInput(req.body)
  const productIds = [...input.items.keys()]

  // 4. ONE TRANSACTION for the whole checkout: save the order, save its items, reduce stock,
  //    empty the cart. If ANY step fails (e.g. out of stock), ROLLBACK undoes all of it:
  //    no order without stock taken, no stock taken without an order.
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 5. SELECT ... FOR UPDATE LOCKS these product rows until COMMIT.
    //    Without it, two customers buying the LAST lamp at the same moment could both read
    //    "stock = 1", both pass the check, and stock would end at -1 (a RACE CONDITION).
    //    With the lock, the second checkout waits, then reads stock = 0 and gets a clear error.
    const { rows: products } = await client.query<{ id: number; title: string; price: string; stock: number; image: string | null }>(
      `SELECT p.id, p.title, p.price, p.stock,
              (SELECT url FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) AS image
       FROM products p
       WHERE p.id = ANY($1::int[])
       FOR UPDATE`,
      [productIds],
    )

    // 409 Conflict = the request is fine, but it clashes with the current state of the data.
    if (products.length !== productIds.length) {
      throw new HttpError(409, 'Some products in your cart are no longer available. Please review your cart.')
    }
    for (const p of products) {
      const wanted = input.items.get(p.id)!
      if (p.stock < wanted) {
        throw new HttpError(409, p.stock === 0 ? `"${p.title}" just sold out` : `Only ${p.stock} left of "${p.title}"`)
      }
    }

    // 6. PRICES COME FROM THE DATABASE, never from the request.
    const subtotalCents = products.reduce((sum, p) => sum + toCents(p.price) * input.items.get(p.id)!, 0)
    const totals = computeTotalsCents(subtotalCents, input.shippingMethod)
    const a = input.address

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO orders (user_id, email, first_name, last_name, address, apartment, city, postal_code, country,
                           shipping_method, subtotal, shipping, tax, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [req.user!.id, input.email, a.firstName, a.lastName, a.address, a.apartment, a.city, a.postalCode, a.country,
        input.shippingMethod, toDollars(totals.subtotal), toDollars(totals.shipping), toDollars(totals.tax), toDollars(totals.total)],
    )
    const orderId = rows[0]!.id

    // 7. All items in ONE insert with unnest() over parallel arrays (one array per column).
    await client.query(
      `INSERT INTO order_items (order_id, product_id, title, image, unit_price, quantity)
       SELECT $1, * FROM unnest($2::int[], $3::text[], $4::text[], $5::numeric[], $6::int[])`,
      [orderId, products.map((p) => p.id), products.map((p) => p.title), products.map((p) => p.image),
        products.map((p) => p.price), products.map((p) => input.items.get(p.id)!)],
    )

    // 8. Take the items out of stock: UPDATE ... FROM joins the table with our (id, qty) list.
    await client.query(
      `UPDATE products SET stock = stock - t.quantity
       FROM unnest($1::int[], $2::int[]) AS t(id, quantity)
       WHERE products.id = t.id`,
      [productIds, productIds.map((id) => input.items.get(id)!)],
    )

    // 9. The order is placed: empty this user's saved cart (same transaction).
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user!.id])

    await client.query('COMMIT')
    const [order] = await fetchOrders('WHERE o.id = $1', [orderId])
    res.status(201).json(order)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error // HttpError -> its status; anything else -> 500 (see index.ts)
  } finally {
    client.release()
  }
})

// 10. GET /api/orders/mine -> the logged-in user's order history (newest first).
//     Defined BEFORE any '/:id' route, otherwise "mine" would be read as an id.
ordersRouter.get('/mine', requireAuth, async (req, res) => {
  res.json(await fetchOrders('WHERE o.user_id = $1', [req.user!.id]))
})

// GET /api/orders -> ALL orders (admin only)
ordersRouter.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  res.json(await fetchOrders('', []))
})

// 11. PATCH /api/orders/1001/status  body: { status: 'shipped' }  (admin only)
//     Cancelling puts the items BACK in stock. A cancelled order can't be changed again
//     (otherwise cancel -> placed -> cancel would add the stock back twice).
ordersRouter.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const id = Number(req.params.id)
  const status: unknown = req.body?.status
  if (!isId(id)) throw new HttpError(400, 'Invalid order id')
  if (!ORDER_STATUSES.some((s) => s === status)) throw new HttpError(400, `Status must be one of: ${ORDER_STATUSES.join(', ')}`)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{ status: OrderStatus }>('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [id])
    const current = rows[0]
    if (!current) throw new HttpError(404, 'Order not found')
    if (current.status === 'cancelled') throw new HttpError(400, 'A cancelled order cannot be changed')

    if (status === 'cancelled') {
      // Restock. Items whose product was deleted (product_id NULL) simply don't match.
      await client.query(
        `UPDATE products SET stock = stock + oi.quantity
         FROM order_items oi
         WHERE oi.order_id = $1 AND products.id = oi.product_id`,
        [id],
      )
    }
    await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  const [order] = await fetchOrders('WHERE o.id = $1', [id])
  res.json(order)
})
