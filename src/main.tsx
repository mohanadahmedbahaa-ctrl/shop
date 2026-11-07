import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.tsx'
import { CartProvider } from './context/CartProvider'
import './index.css'

// The ENTRY POINT: finds <div id="root"> in index.html and renders the React app into it.
// The `!` tells TypeScript "trust me, this element exists" (non-null assertion).
//
// The wrappers, from outside in:
// - StrictMode: dev-only checks that warn about common mistakes (it doesn't affect production).
// - BrowserRouter: enables routing using the browser's URL.
// - CartProvider: gives every component inside access to the cart via useCart().
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
