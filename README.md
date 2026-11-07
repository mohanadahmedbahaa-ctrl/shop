# Oakline: e-commerce frontend

A responsive online store built with **React 19, TypeScript, Tailwind CSS v4 and React Router**.
Products are fake data (from [DummyJSON](https://dummyjson.com)); a Node.js/Express API will replace it next.

## Features

- **Home page**: hero, category tiles, top-rated and on-sale sections
- **Shop page**: search, category, price and rating filters, "on sale" toggle and sorting.
  Filters live in the URL (`/shop?category=kitchen&sort=price-asc`), so they can be shared and bookmarked
- **Product page**: image gallery, ratings, stock status, quantity selector, related products
- **Cart**: slide-out drawer + full cart page, free-shipping progress bar, saved in `localStorage`
- **Checkout**: validated form (accessible error messages, focus on the first error), delivery options,
  order confirmation page (demo: no payment is collected)
- **Responsive and accessible**: mobile menu, keyboard support (Escape closes the drawer, skip link),
  ARIA labels, semantic HTML

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · lucide-react icons

## Run locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  components/
    cart/      CartDrawer, CartLineItem, OrderSummary, FreeShippingProgress
    layout/    Layout (header + footer + <Outlet />), Header, Footer, SearchForm, Logo
    product/   ProductCard, ProductGrid, ProductGallery
    shop/      FilterPanel
    ui/        Button, Container, Rating, Price, QuantitySelector, TextField, Breadcrumbs
  context/     Cart state (React Context + useState + localStorage)
  data/        Product type + fake products
  pages/       Home, Shop, Product, Cart, Checkout, OrderConfirmation, NotFound
  types/       Order types
  utils/       Pricing rules, filtering/sorting, formatting
```
