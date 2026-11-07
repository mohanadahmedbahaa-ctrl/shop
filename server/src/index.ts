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

// 1. The Express APP. A request travels top to bottom through everything registered
//    with app.use / app.get until something sends a response.
const app = express()

// 2. MIDDLEWARE = a function that runs on every request before your routes.
//    CORS: browsers block a page on localhost:5173 from reading responses from localhost:3001
//    (a different "origin") unless the server says it's allowed. This middleware says so,
//    for the React dev server only.
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))

// JSON BODY PARSER: turns the JSON text of a POST/PATCH request into a JS object on req.body.
// Without it, req.body is undefined. The limit stops someone sending a 1 GB body.
app.use(express.json({ limit: '100kb' }))

// 3. A health check: proves the server AND the database work. Hosting platforms call it too.
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok' })
})

// 4. Mount the routers. REST naming: plural nouns for collections (/products),
//    and the id in the path for one item (/products/3). The HTTP method (GET) is the verb.
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/auth', authRouter) // signup, login, me
app.use('/api/users', usersRouter) // admin only
app.use('/api/cart', cartRouter) // logged-in user's cart
app.use('/api/orders', ordersRouter) // checkout, order history, admin order management
app.use('/api/admin', adminRouter) // dashboard stats (admin only)

// 5. No route matched: send JSON, not Express's default HTML page.
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// 6. ERROR HANDLER: Express knows it's one because it takes FOUR arguments.
//    Express 5 sends errors thrown inside async routes here automatically
//    (Express 4 needed try/catch in every route).
//    Log the details for YOU, but send the client a generic message: real error
//    text can leak table names or other internals to attackers.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Broken JSON in a request body is the CLIENT's mistake (400), not a server error (500).
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    res.status(400).json({ error: 'Invalid or too large JSON body' })
    return
  }
  // An EXPECTED error a route threw on purpose (out of stock, not found...): its status + message.
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
}
app.use(errorHandler)

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`Oakline API running on http://localhost:${port}`)
})
