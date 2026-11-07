// App is the LAYOUT + ROUTER: the Navbar is always visible,
// and <Routes> picks which page to show based on the URL.
import { Route, Routes } from 'react-router'
import Navbar from './components/Navbar'
import CartPage from './pages/CartPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import ProductDetailsPage from './pages/ProductDetailsPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      {/* max-w-6xl mx-auto = centered content with a max width, like a container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* ROUTING: each <Route> maps a URL path to a component.
            - "/product/:id" has a URL PARAMETER (:id), read with useParams() in the page.
            - "*" matches anything else, so it's the 404 page. */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
