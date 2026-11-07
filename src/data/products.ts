// FAKE DATA for Phase 1. Images and texts come from https://dummyjson.com (a free fake-store API).
// In Phase 2 this file is replaced by a real API: your Node/Express backend.

// 1. A UNION TYPE: `category` can only be one of these exact strings.
//    A typo like 'kitchn' becomes a TypeScript error instead of a silent bug.
export type Category = 'home' | 'kitchen' | 'fashion' | 'accessories' | 'sport'

// 2. The shape of one product. `?` makes a field OPTIONAL:
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
}

// 3. Category info for the UI. `Record<Category, ...>` means "an object with
//    EXACTLY one key per Category". If you add a category to the union above,
//    TypeScript forces you to add it here too.
export const categoryInfo: Record<Category, { name: string; tagline: string }> = {
  home: { name: 'Home & Living', tagline: 'Pieces that make a house feel like home' },
  kitchen: { name: 'Kitchen', tagline: 'Tools for everyday cooking' },
  fashion: { name: 'Fashion', tagline: 'Shirts and dresses for every day' },
  accessories: { name: 'Accessories', tagline: 'Bags, shades and watches' },
  sport: { name: 'Sport', tagline: 'Gear for game day' },
}

// Object.keys() returns string[], so we tell TypeScript these are Category values.
export const categories = Object.keys(categoryInfo) as Category[]

export const products: Product[] = 
[
  {
    id: 1,
    title: "Bedside Table African Cherry",
    description: "The Bedside Table in African Cherry is a stylish and functional addition to your bedroom, providing convenient storage space and a touch of elegance.",
    category: "home",
    price: 299.99,
    compareAtPrice: 370.99,
    rating: 2.9,
    reviewCount: 13,
    stock: 64,
    images: [
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/1.webp",
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/2.webp",
      "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/3.webp"
    ]
  },
  {
    id: 2,
    title: "Decoration Swing",
    description: "The Decoration Swing is a charming addition to your home decor. Crafted with intricate details, it adds a touch of elegance and whimsy to any room.",
    category: "home",
    price: 59.99,
    rating: 3.2,
    reviewCount: 163,
    stock: 47,
    images: [
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/3.webp"
    ]
  },
  {
    id: 3,
    title: "House Showpiece Plant",
    description: "The House Showpiece Plant is an artificial plant that brings a touch of nature to your home without the need for maintenance. It adds greenery and style to any space.",
    category: "home",
    price: 39.99,
    rating: 4.7,
    reviewCount: 237,
    stock: 28,
    images: [
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/3.webp"
    ]
  },
  {
    id: 4,
    title: "Plant Pot",
    description: "The Plant Pot is a stylish container for your favorite plants. With a sleek design, it complements your indoor or outdoor garden, adding a modern touch to your plant display.",
    category: "home",
    price: 14.99,
    rating: 3,
    reviewCount: 34,
    stock: 59,
    images: [
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/1.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/2.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/3.webp",
      "https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/4.webp"
    ]
  },
  {
    id: 5,
    title: "Table Lamp",
    description: "The Table Lamp is a functional and decorative lighting solution for your living space. With a modern design, it provides both ambient and task lighting, enhancing the atmosphere.",
    category: "home",
    price: 49.99,
    rating: 3.6,
    reviewCount: 71,
    stock: 9,
    images: [
      "https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp"
    ]
  },
  {
    id: 6,
    title: "Boxed Blender",
    description: "The Boxed Blender is a powerful and compact blender perfect for smoothies, shakes, and more. Its convenient design and multiple functions make it a versatile kitchen appliance.",
    category: "kitchen",
    price: 39.99,
    rating: 4.6,
    reviewCount: 219,
    stock: 9,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/boxed-blender/4.webp"
    ]
  },
  {
    id: 7,
    title: "Electric Stove",
    description: "The Electric Stove provides a portable and efficient cooking solution. Ideal for small kitchens or as an additional cooking surface for various culinary needs.",
    category: "kitchen",
    price: 49.99,
    compareAtPrice: 58.99,
    rating: 4.1,
    reviewCount: 164,
    stock: 21,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/electric-stove/4.webp"
    ]
  },
  {
    id: 8,
    title: "Microwave Oven",
    description: "The Microwave Oven is a versatile kitchen appliance for quick and efficient cooking, reheating, and defrosting. Its compact size makes it suitable for various kitchen setups.",
    category: "kitchen",
    price: 89.99,
    compareAtPrice: 102.99,
    rating: 4.8,
    reviewCount: 54,
    stock: 59,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/1.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/2.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/3.webp",
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/microwave-oven/4.webp"
    ]
  },
  {
    id: 9,
    title: "Silver Pot With Glass Cap",
    description: "The Silver Pot with Glass Cap is a stylish and functional cookware item for boiling, simmering, and preparing delicious meals. Its glass cap allows you to monitor cooking progress.",
    category: "kitchen",
    price: 39.99,
    rating: 3.2,
    reviewCount: 239,
    stock: 40,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp"
    ]
  },
  {
    id: 10,
    title: "Spice Rack",
    description: "The Spice Rack is a convenient organizer for your spices and seasonings. Keep your kitchen essentials within reach and neatly arranged with this stylish spice rack.",
    category: "kitchen",
    price: 19.99,
    compareAtPrice: 22.99,
    rating: 4.9,
    reviewCount: 73,
    stock: 79,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/spice-rack/1.webp"
    ]
  },
  {
    id: 11,
    title: "Chopping Board",
    description: "The Chopping Board is an essential kitchen accessory for food preparation. Made from durable material, it provides a safe and hygienic surface for cutting and chopping.",
    category: "kitchen",
    price: 12.99,
    rating: 3.7,
    reviewCount: 53,
    stock: 14,
    images: [
      "https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/1.webp"
    ]
  },
  {
    id: 12,
    title: "Blue & Black Check Shirt",
    description: "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    category: "fashion",
    price: 29.99,
    compareAtPrice: 35.99,
    rating: 3.6,
    reviewCount: 203,
    stock: 38,
    images: [
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/4.webp"
    ]
  },
  {
    id: 13,
    title: "Man Plaid Shirt",
    description: "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    category: "fashion",
    price: 34.99,
    compareAtPrice: 43.99,
    rating: 3.5,
    reviewCount: 37,
    stock: 82,
    images: [
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/4.webp"
    ]
  },
  {
    id: 14,
    title: "Men Check Shirt",
    description: "The Men Check Shirt is a classic and versatile shirt featuring a stylish check pattern. Suitable for various occasions, it adds a smart and polished touch to your wardrobe.",
    category: "fashion",
    price: 27.99,
    rating: 2.7,
    reviewCount: 111,
    stock: 95,
    images: [
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/3.webp",
      "https://cdn.dummyjson.com/product-images/mens-shirts/men-check-shirt/4.webp"
    ]
  },
  {
    id: 15,
    title: "Blue Frock",
    description: "The Blue Frock is a charming and stylish dress for various occasions. With a vibrant blue color and a comfortable design, it adds a touch of elegance to your wardrobe.",
    category: "fashion",
    price: 29.99,
    compareAtPrice: 34.99,
    rating: 4.2,
    reviewCount: 246,
    stock: 52,
    images: [
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/blue-frock/4.webp"
    ]
  },
  {
    id: 16,
    title: "Gray Dress",
    description: "The Gray Dress is a versatile and chic option for various occasions. With a neutral gray color, it can be dressed up or down, making it a wardrobe staple for any fashion-forward individual.",
    category: "fashion",
    price: 34.99,
    compareAtPrice: 40.99,
    rating: 2.7,
    reviewCount: 80,
    stock: 55,
    images: [
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/gray-dress/4.webp"
    ]
  },
  {
    id: 17,
    title: "Tartan Dress",
    description: "The Tartan Dress features a classic tartan pattern, bringing a timeless and sophisticated touch to your wardrobe. Perfect for fall and winter, it adds a hint of traditional charm.",
    category: "fashion",
    price: 39.99,
    compareAtPrice: 45.99,
    rating: 4.1,
    reviewCount: 154,
    stock: 73,
    images: [
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/1.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/2.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/3.webp",
      "https://cdn.dummyjson.com/product-images/tops/tartan-dress/4.webp"
    ]
  },
  {
    id: 18,
    title: "Blue Women's Handbag",
    description: "The Blue Women's Handbag is a stylish and spacious accessory for everyday use. With a vibrant blue color and multiple compartments, it combines fashion and functionality.",
    category: "accessories",
    price: 49.99,
    compareAtPrice: 60.99,
    rating: 2.9,
    reviewCount: 136,
    stock: 76,
    images: [
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/3.webp"
    ]
  },
  {
    id: 19,
    title: "White Faux Leather Backpack",
    description: "The White Faux Leather Backpack is a trendy and practical backpack for the modern woman. With a sleek white design and ample storage space, it's perfect for both casual and on-the-go styles.",
    category: "accessories",
    price: 39.99,
    compareAtPrice: 47.99,
    rating: 3.4,
    reviewCount: 247,
    stock: 39,
    images: [
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/3.webp"
    ]
  },
  {
    id: 20,
    title: "Women Handbag",
    description: "The Women Handbag in Black is a classic and versatile accessory that complements various outfits. With a timeless black color and functional design, it's a must-have in every woman's wardrobe.",
    category: "accessories",
    price: 59.99,
    rating: 2.9,
    reviewCount: 44,
    stock: 11,
    images: [
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/1.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/2.webp",
      "https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/3.webp"
    ]
  },
  {
    id: 21,
    title: "Black Sun Glasses",
    description: "The Black Sun Glasses are a classic and stylish choice, featuring a sleek black frame and tinted lenses. They provide both UV protection and a fashionable look.",
    category: "accessories",
    price: 29.99,
    rating: 4.4,
    reviewCount: 190,
    stock: 60,
    images: [
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/3.webp"
    ]
  },
  {
    id: 22,
    title: "Classic Sun Glasses",
    description: "The Classic Sun Glasses offer a timeless design with a neutral frame and UV-protected lenses. These sunglasses are versatile and suitable for various occasions.",
    category: "accessories",
    price: 24.99,
    rating: 3.9,
    reviewCount: 227,
    stock: 1,
    images: [
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/1.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/2.webp",
      "https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/3.webp"
    ]
  },
  {
    id: 23,
    title: "Brown Leather Belt Watch",
    description: "The Brown Leather Belt Watch is a stylish timepiece with a classic design. Featuring a genuine leather strap and a sleek dial, it adds a touch of sophistication to your look.",
    category: "accessories",
    price: 89.99,
    rating: 4.2,
    reviewCount: 93,
    stock: 32,
    images: [
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/2.webp",
      "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/3.webp"
    ]
  },
  {
    id: 24,
    title: "Baseball Glove",
    description: "The Baseball Glove is a protective glove worn by baseball players. It is designed to catch and field the baseball, providing players with comfort and control during the game.",
    category: "sport",
    price: 24.99,
    rating: 4,
    reviewCount: 115,
    stock: 22,
    images: [
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/1.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/2.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/3.webp"
    ]
  },
  {
    id: 25,
    title: "Cricket Helmet",
    description: "The Cricket Helmet is a protective headgear worn by cricket players, especially batsmen and wicketkeepers. It provides protection against fast bowling and bouncers.",
    category: "sport",
    price: 44.99,
    rating: 4.7,
    reviewCount: 60,
    stock: 10,
    images: [
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/1.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/2.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/3.webp",
      "https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet/4.webp"
    ]
  },
  {
    id: 26,
    title: "Tennis Racket",
    description: "The Tennis Racket is an essential piece of equipment used in the sport of tennis. It features a frame with strings and a grip, allowing players to hit the tennis ball.",
    category: "sport",
    price: 49.99,
    compareAtPrice: 62.99,
    rating: 4,
    reviewCount: 116,
    stock: 6,
    images: [
      "https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/1.webp"
    ]
  },
  {
    id: 27,
    title: "Basketball",
    description: "The Basketball is a standard ball used in basketball games. It is designed for dribbling, shooting, and passing in the game of basketball, suitable for both indoor and outdoor play.",
    category: "sport",
    price: 14.99,
    rating: 4.7,
    reviewCount: 152,
    stock: 75,
    images: [
      "https://cdn.dummyjson.com/product-images/sports-accessories/basketball/1.webp"
    ]
  }
]
