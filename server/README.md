# E-commerce API

REST API for the E-commerce store: **Node.js + Express 5 + PostgreSQL**, written in TypeScript
(run directly by Node 24, no build step). Accounts with **bcrypt** password hashing and **JWT** login tokens.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then set your postgres password and a JWT_SECRET in .env
npm run db:setup          # creates the "oakline" database, tables, 27 products and 4 demo accounts
npm run dev               # http://localhost:3001 (restarts on file changes)
```

`npm run db:setup` **resets all data** (products and accounts). Use it in development only.

## Roles

| Role | Can do | How you get it |
| --- | --- | --- |
| buyer | shop and check out | sign up as a buyer |
| seller | add products, delete **their own** products | sign up as a seller |
| moderator | everything a seller can, plus delete **any** product | an admin assigns it |
| admin | everything, plus change any user's role | an admin assigns it (or a demo account) |

Demo accounts (password = `DEMO_PASSWORD` in `.env`): `admin@ecommerce.test`, `moderator@ecommerce.test`,
`seller@ecommerce.test`, `buyer@ecommerce.test`.

## Endpoints

Protected routes need the header `Authorization: Bearer <token>` (the token comes from signup or login).

| Method | URL | Who | Returns |
| --- | --- | --- | --- |
| GET | `/api/health` | anyone | `{ "status": "ok" }` if the server and database work |
| GET | `/api/products` | anyone | all products (`?category=kitchen` to filter) |
| GET | `/api/products/:id` | anyone | one product, `404` if missing, `400` if the id is invalid |
| POST | `/api/products` | seller, moderator, admin | `201` + the new product |
| DELETE | `/api/products/:id` | owner seller, moderator, admin | `204`, `403` if not allowed |
| GET | `/api/categories` | anyone | all categories, in navbar order |
| POST | `/api/auth/signup` | anyone | `201` + `{ token, user }` (`accountType`: buyer or seller), `409` if the email is taken |
| POST | `/api/auth/login` | anyone | `{ token, user }`, `401` if wrong email or password |
| GET | `/api/auth/me` | logged in | the current user |
| GET | `/api/cart` | logged in | your saved cart `[{ productId, quantity }]` |
| PUT | `/api/cart/:productId` | logged in | set a line's quantity (capped at stock) -> the whole cart |
| DELETE | `/api/cart/:productId` | logged in | remove a line -> the whole cart |
| DELETE | `/api/cart` | logged in | empty the cart |
| POST | `/api/cart/merge` | logged in | add a guest cart into the account's cart (called at login) |
| POST | `/api/orders` | logged in | `201` + the order. Server recomputes prices, `409` if out of stock |
| GET | `/api/orders/mine` | logged in | your order history |
| GET | `/api/orders` | admin | all orders |
| PATCH | `/api/orders/:id/status` | admin | `{ "status": "shipped" }`; `cancelled` restocks and is final |
| GET | `/api/admin/stats` | admin | revenue, order/product/user counts, low stock, recent orders |
| GET | `/api/users` | admin | all users (never the password hashes) |
| PATCH | `/api/users/:id/role` | admin | the updated user (`{ "role": "moderator" }`) |

## Files

```
server/
  db/schema.sql        tables (users, categories, products, product_images, cart_items, orders, order_items)
  db/seed.sql          categories and the 27 products
  src/index.ts         Express app: middleware, routes, error handler
  src/db.ts            the PostgreSQL connection pool
  src/auth.ts          password hashing, JWT tokens, requireAuth / requireRole middleware
  src/pricing.ts       money rules in cents (prices are never taken from the client)
  src/errors.ts        HttpError: throw it anywhere, the error handler sends its status
  src/routes/          one router per resource: products, categories, auth, users, cart, orders, admin
  src/scripts/setup-db.ts
```
