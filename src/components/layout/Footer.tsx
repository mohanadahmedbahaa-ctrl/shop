import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { categories, categoryInfo } from '../../data/products'
import { FREE_SHIPPING_THRESHOLD } from '../../utils/pricing'
import Button from '../ui/Button'
import Container from '../ui/Container'
import Logo from './Logo'

function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubscribed(true)
  }

  if (subscribed) {
    return <p className="mt-4 text-sm font-medium text-brand-700">Thanks for subscribing! 🎉</p>
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm gap-2">
      <input
        type="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="h-11 min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 text-sm outline-none focus:border-stone-500"
      />
      <Button type="submit">Subscribe</Button>
    </form>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-stone-200 bg-stone-50">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-stone-600">
            Everyday essentials for your home, kitchen and wardrobe. Get new arrivals and offers in your inbox.
          </p>
          <NewsletterForm />
        </div>

        <div>
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            {categories.map((c) => (
              <li key={c}>
                <Link to={`/shop?category=${c}`} className="hover:text-stone-900">
                  {categoryInfo[c].name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Customer care</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-600">
            <li>Free shipping over ${FREE_SHIPPING_THRESHOLD}</li>
            <li>30-day free returns</li>
            <li>Ships in 1–2 business days</li>
            <li>Secure checkout</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-stone-200">
        <Container className="flex flex-col gap-2 py-6 text-xs text-stone-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Oakline. A demo store, so no real orders are placed.</p>
          <p>Built with React, TypeScript &amp; Tailwind CSS · Product data from DummyJSON</p>
        </Container>
      </div>
    </footer>
  )
}

export default Footer
