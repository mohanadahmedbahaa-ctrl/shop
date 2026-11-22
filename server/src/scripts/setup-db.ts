import bcrypt from 'bcryptjs'
import { readFile } from 'node:fs/promises'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is missing. Copy server/.env.example to server/.env and add your password.')
}

const dbName = new URL(url).pathname.slice(1)
if (!/^\w+$/.test(dbName)) {
  throw new Error(`Invalid database name: "${dbName}"`)
}

try {
  // Locally we create the database if it is missing (via the default "postgres" database).
  // Hosted databases (e.g. Neon) already exist and may not allow this, so a failure here is not fatal.
  const adminUrl = new URL(url)
  adminUrl.pathname = '/postgres'
  const admin = new pg.Client({ connectionString: adminUrl.toString() })
  try {
    await admin.connect()
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE ${dbName}`)
      console.log(`Created database "${dbName}"`)
    }
  } catch {
    console.log(`Skipping the "create database" step, using "${dbName}" as it is`)
  } finally {
    await admin.end().catch(() => {})
  }

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  for (const file of ['schema.sql', 'seed.sql']) {
    const sql = await readFile(new URL(`../../db/${file}`, import.meta.url), 'utf8')
    await client.query(sql)
    console.log(`Ran db/${file}`)
  }

  const demoPassword = process.env.DEMO_PASSWORD
  if (demoPassword) {
    const hash = await bcrypt.hash(demoPassword, 10)
    const demoUsers = [
      ['Ada Admin', 'admin@ecommerce.test', 'admin'],
      ['Mona Moderator', 'moderator@ecommerce.test', 'moderator'],
      ['Sam Seller', 'seller@ecommerce.test', 'seller'],
      ['Bob Buyer', 'buyer@ecommerce.test', 'buyer'],
    ]
    for (const [name, email, role] of demoUsers) {
      await client.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role])
    }
    console.log(`Created demo accounts (password from DEMO_PASSWORD): ${demoUsers.map((u) => u[1]).join(', ')}`)
  }

  const { rows } = await client.query('SELECT COUNT(*)::int AS count FROM products')
  console.log(`Done: ${rows[0].count} products in "${dbName}"`)
  await client.end()
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === '28P01') {
    console.error('Wrong password: check DATABASE_URL in server/.env')
  } else {
    console.error(error)
  }
  process.exitCode = 1
}
