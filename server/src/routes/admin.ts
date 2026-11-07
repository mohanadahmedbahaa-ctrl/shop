import { Router } from 'express'
import { requireAuth, requireRole } from '../auth.ts'
import { pool } from '../db.ts'
import { fetchOrders } from './orders.ts'

export const adminRouter = Router()
adminRouter.use(requireAuth, requireRole('admin'))

const LOW_STOCK = 10

adminRouter.get('/stats', async (_req, res) => {
  const [orderStats, usersByRole, productCount, lowStock, recentOrders] = await Promise.all([
    pool.query<{ orders: number; revenue: string; open: number }>(
      `SELECT COUNT(*)::int AS orders,
              COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0) AS revenue,
              COUNT(*) FILTER (WHERE status = 'placed')::int AS open
       FROM orders`,
    ),
    pool.query<{ role: string; count: number }>('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'),
    pool.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM products'),
    pool.query<{ id: number; title: string; stock: number }>(
      'SELECT id, title, stock FROM products WHERE stock <= $1 ORDER BY stock, id LIMIT 8',
      [LOW_STOCK],
    ),
    fetchOrders('', [], 8),
  ])

  const o = orderStats.rows[0]!
  res.json({
    revenue: Number(o.revenue),
    orderCount: o.orders,
    openOrders: o.open,
    productCount: productCount.rows[0]!.count,
    usersByRole: Object.fromEntries(usersByRole.rows.map((r) => [r.role, r.count])),
    lowStock: lowStock.rows,
    recentOrders: recentOrders,
  })
})
