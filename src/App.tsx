import { Route, Routes } from 'react-router'
import RequireAuth from './components/auth/RequireAuth'
import Layout from './components/layout/Layout'
import AccountPage from './pages/AccountPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import DashboardPage from './pages/admin/DashboardPage'
import UsersPage from './pages/admin/UsersPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ManageProductsPage from './pages/dashboard/ManageProductsPage'
import NewProductPage from './pages/dashboard/NewProductPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import OrdersPage from './pages/OrdersPage'
import ProductPage from './pages/ProductPage'
import ShopPage from './pages/ShopPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="order-confirmation" element={<OrderConfirmationPage />} />

        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="account/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="dashboard/products"
          element={
            <RequireAuth roles={['seller', 'moderator', 'admin']}>
              <ManageProductsPage />
            </RequireAuth>
          }
        />
        <Route
          path="dashboard/products/new"
          element={
            <RequireAuth roles={['seller', 'moderator', 'admin']}>
              <NewProductPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAuth roles={['admin']}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin/orders"
          element={
            <RequireAuth roles={['admin']}>
              <AdminOrdersPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin/users"
          element={
            <RequireAuth roles={['admin']}>
              <UsersPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
