import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { pool } from './db.ts'
import { HttpError } from './errors.ts'
import { adminRouter } from './routes/admin.ts'
import { authRouter } from './routes/auth.ts'
import { cartRouter } from './routes/cart.ts'
import { categoriesRouter } from './routes/categories.ts'
import { ordersRouter } from './routes/orders.ts'
import { productsRouter } from './routes/products.ts'
import { usersRouter } from './routes/users.ts'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok' })
})

app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/admin', adminRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    res.status(400).json({ error: 'Invalid or too large JSON body' })
    return
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
}
app.use(errorHandler)

// On Vercel the platform runs the app for us (serverless), so we only export it.
// Locally (and on normal servers) we start listening on a port ourselves.
if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3001)
  app.listen(port, () => {
    console.log(`E-commerce API running on http://localhost:${port}`)
  })
}

export default app
