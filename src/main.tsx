import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider'
import { CartProvider } from './context/CartProvider'
import { ProductsProvider } from './context/ProductsProvider'
import './index.css'

// The ENTRY POINT: finds <div id="root"> in index.html and renders the React app into it.
// The `!` tells TypeScript "trust me, this element exists" (non-null assertion).
//
// The wrappers, from outside in:
// - StrictMode: dev-only checks that warn about common mistakes (it doesn't affect production).
// - BrowserRouter: enables routing using the browser's URL.
// - AuthProvider: who is logged in, via useAuth().
// - ProductsProvider: loads the catalog from the API, via useProducts().
// - CartProvider: the cart, via useCart(). It must be INSIDE ProductsProvider,
//   because it calls useProducts() to look up the products in the cart.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
