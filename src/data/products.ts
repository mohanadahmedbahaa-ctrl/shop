export type Product = {
  id: number
  title: string
  price: number
  image: string
  category: string
  description: string
}

export const products: Product[] = [
  {
    id: 1,
    title: 'Wireless Headphones',
    price: 79.99,
    image: 'https://picsum.photos/seed/1/300',
    category: 'electronics',
    description: 'Over-ear headphones with noise cancelling and 30-hour battery life.',
  },
  {
    id: 2,
    title: 'Smart Watch',
    price: 129.5,
    image: 'https://picsum.photos/seed/2/300',
    category: 'electronics',
    description: 'Tracks steps, heart rate and sleep. Water resistant up to 50 m.',
  },
  {
    id: 3,
    title: 'Cotton T-Shirt',
    price: 19.99,
    image: 'https://picsum.photos/seed/3/300',
    category: 'clothing',
    description: 'Soft 100% cotton t-shirt with a regular fit.',
  },
  {
    id: 4,
    title: 'Denim Jacket',
    price: 59.0,
    image: 'https://picsum.photos/seed/4/300',
    category: 'clothing',
    description: 'Classic blue denim jacket that goes with everything.',
  },
  {
    id: 5,
    title: 'Ceramic Coffee Mug',
    price: 12.49,
    image: 'https://picsum.photos/seed/5/300',
    category: 'home',
    description: 'A 350 ml mug that is safe in the dishwasher and microwave.',
  },
  {
    id: 6,
    title: 'Desk Lamp',
    price: 34.99,
    image: 'https://picsum.photos/seed/6/300',
    category: 'home',
    description: 'LED desk lamp with 3 brightness levels and a flexible neck.',
  },
]
