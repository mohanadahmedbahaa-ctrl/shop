import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Copy server/.env.example to server/.env and add your password.')
}

export const pool = new pg.Pool({ connectionString })
