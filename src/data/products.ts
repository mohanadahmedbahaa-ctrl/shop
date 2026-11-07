// TYPES + CATEGORIES shared by the whole app.
// Phase 1 kept 27 fake products here. Phase 2: the products live in PostgreSQL and arrive from
// the API (GET /api/products). See context/ProductsProvider.tsx. The same data is in
// server/db/seed.sql.

// 1. A UNION TYPE: `category` can only be one of these exact strings.
//    A typo like 'kitchn' becomes a TypeScript error instead of a silent bug.
//    The database enforces the same list with a foreign key to the `categories` table.
export type Category = 'home' | 'kitchen' | 'fashion' | 'accessories' | 'sport'

// 2. The shape of one product, exactly what the API sends. `?` makes a field OPTIONAL:
//    only products on sale have a compareAtPrice (the old, crossed-out price).
export type Product = {
  id: number
  title: string
  description: string
  category: Category
  price: number
  compareAtPrice?: number
  rating: number
  reviewCount: number
  stock: number
  images: string[]
  sellerId: number | null // who added it; null = the store's own catalog
  sellerName: string | null
}

// 3. Category info for the UI. `Record<Category, ...>` means "an object with
//    EXACTLY one key per Category". If you add a category to the union above,
//    TypeScript forces you to add it here too.
//    (Categories almost never change, so they stay in the frontend: the navbar can render
//    instantly without waiting for the API.)
export const categoryInfo: Record<Category, { name: string; tagline: string }> = {
  home: { name: 'Home & Living', tagline: 'Pieces that make a house feel like home' },
  kitchen: { name: 'Kitchen', tagline: 'Tools for everyday cooking' },
  fashion: { name: 'Fashion', tagline: 'Shirts and dresses for every day' },
  accessories: { name: 'Accessories', tagline: 'Bags, shades and watches' },
  sport: { name: 'Sport', tagline: 'Gear for game day' },
}

// Object.keys() returns string[], so we tell TypeScript these are Category values.
export const categories = Object.keys(categoryInfo) as Category[]
