import { Link } from 'react-router'
import { buttonStyles } from '../components/ui/buttonStyles'
import Container from '../components/ui/Container'

type Props = {
  title?: string
  message?: string
}

function NotFoundPage({ title = 'Page not found', message = "Sorry, we couldn't find the page you're looking for." }: Props) {
  return (
    <Container className="py-24 text-center">
      <title>{`${title} · Oakline`}</title>
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-stone-600">{message}</p>
      <div className="mt-10 flex justify-center gap-3">
        <Link to="/" className={buttonStyles('primary', 'lg')}>
          Go home
        </Link>
        <Link to="/shop" className={buttonStyles('secondary', 'lg')}>
          Browse products
        </Link>
      </div>
    </Container>
  )
}

export default NotFoundPage
