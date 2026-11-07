export type Category = 'home' | 'kitchen' | 'fashion' | 'accessories' | 'sport'

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
  sellerId: number | null
  sellerName: string | null
}

export const categoryInfo: Record<Category, { name: string; tagline: string }> = {
  home: { name: 'Home & Living', tagline: 'Pieces that make a house feel like home' },
  kitchen: { name: 'Kitchen', tagline: 'Tools for everyday cooking' },
  fashion: { name: 'Fashion', tagline: 'Shirts and dresses for every day' },
  accessories: { name: 'Accessories', tagline: 'Bags, shades and watches' },
  sport: { name: 'Sport', tagline: 'Gear for game day' },
}

export const categories = Object.keys(categoryInfo) as Category[]
