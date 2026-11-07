import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import ProductPage from './pages/ProductPage'
import ShopPage from './pages/ShopPage'

// NESTED ROUTES: the parent <Route element={<Layout />}> has no path of its own.
// It renders the header/footer, and its <Outlet /> shows whichever child matches the URL.
// `index` = the child shown at the parent's own path ("/").
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
