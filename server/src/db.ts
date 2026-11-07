import pg from 'pg'

// 1. process.env holds the variables from .env (loaded by `node --env-file`, see package.json).
//    Secrets like the database password live there, never in the code.
const connectionString = process.env.DATABASE_URL

// 2. FAIL FAST: crash at startup with a clear message, instead of a confusing error
//    on the first request.
if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Copy server/.env.example to server/.env and add your password.')
}

// 3. A POOL keeps a few database connections open and lends them out per query.
//    Opening a new connection for every request would be slow (login + handshake each time).
//    One pool for the whole app: every file imports this same `pool`.
export const pool = new pg.Pool({ connectionString })
