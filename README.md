# My Shop

An e-commerce frontend built with React, TypeScript and Tailwind CSS. It uses fake product data for now; a Node.js/Express API will replace it later.

## Features

- Product grid with live search and category filter
- Product details page (`/product/:id`) with React Router
- Shopping cart: add, change quantity, remove, total price, checkout (demo)
- Cart is shared with React Context and saved to `localStorage`
- Responsive layout with Tailwind CSS

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router

## Run locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  components/   Navbar, ProductCard
  context/      Cart context, provider and useCart() hook
  data/         Product type and fake products
  pages/        Home, ProductDetails, Cart, NotFound
  utils/        formatPrice helper
```
