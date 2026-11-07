import { Link } from 'react-router'

// Shown for any URL that doesn't match a route (see path="*" in App.tsx).
function NotFoundPage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-blue-600 mb-4">404</h1>
      <p className="text-gray-600 mb-6">This page doesn't exist.</p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go to the shop
      </Link>
    </div>
  )
}

export default NotFoundPage
