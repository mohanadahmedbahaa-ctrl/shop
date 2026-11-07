import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { apiFetch } from '../../api/client'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Button from '../../components/ui/Button'
import Container from '../../components/ui/Container'
import TextField from '../../components/ui/TextField'
import { useProducts } from '../../context/ProductsContext'
import { categories, categoryInfo, type Category, type Product } from '../../data/products'

// 1. Form inputs ALWAYS give strings ("19.99"), even type="number". So the form state is
//    all strings, and we convert to numbers only when sending to the API.
type ProductForm = {
  title: string
  description: string
  category: Category
  price: string
  compareAtPrice: string
  stock: string
  images: string // one URL per line in a <textarea>
}
type FormErrors = Partial<Record<keyof ProductForm, string>>

const initialForm: ProductForm = {
  title: '',
  description: '',
  category: 'home',
  price: '',
  compareAtPrice: '',
  stock: '10',
  images: '',
}

// "a\n\n b \n" -> ["a", "b"]: split into lines, trim spaces, drop empty lines.
const parseImageUrls = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

function validate(form: ProductForm): FormErrors {
  const errors: FormErrors = {}
  const price = Number(form.price)
  if (!form.title.trim()) errors.title = 'Enter a product name'
  if (!form.description.trim()) errors.description = 'Describe the product'
  if (!(price > 0)) errors.price = 'Enter a price above 0'
  if (form.compareAtPrice && !(Number(form.compareAtPrice) > price)) {
    errors.compareAtPrice = 'Must be higher than the price (or leave empty)'
  }
  if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'Enter a whole number, 0 or more'
  const urls = parseImageUrls(form.images)
  if (urls.length === 0) errors.images = 'Add at least one image URL'
  else if (urls.length > 8) errors.images = 'Use 8 images or fewer'
  else if (!urls.every((u) => /^https?:\/\/\S+$/.test(u))) errors.images = 'Each line must be a web address starting with http:// or https://'
  return errors
}

// Shared look for the <textarea> and <select>, which TextField (an <input>) can't cover.
const fieldClass =
  'mt-1.5 block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm shadow-xs outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100'

function NewProductPage() {
  const { addProductToList } = useProducts()
  const navigate = useNavigate()
  const [form, setForm] = useState<ProductForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const previewUrl = parseImageUrls(form.images)[0]

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    setServerError(null)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      document.getElementsByName(firstInvalid)[0]?.focus()
      return
    }

    setSubmitting(true)
    try {
      // 2. Convert the strings to the types the API expects. An empty "compare at" becomes null.
      const created = await apiFetch<Product>('/api/products', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
          stock: Number(form.stock),
          images: parseImageUrls(form.images),
        },
      })
      // 3. Add it to the shared catalog, then show the real product page.
      addProductToList(created)
      navigate(`/product/${created.id}`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not save the product')
      setSubmitting(false)
    }
  }

  return (
    <Container className="max-w-5xl py-10">
      <title>Add a product · Oakline</title>
      <Breadcrumbs items={[{ label: 'My account', to: '/account' }, { label: 'Products', to: '/dashboard/products' }, { label: 'New' }]} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Add a product</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <form noValidate onSubmit={handleSubmit} className="space-y-5 lg:col-span-7">
          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <TextField label="Product name" name="title" value={form.title} onChange={handleChange} error={errors.title} maxLength={120} />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={handleChange}
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={fieldClass}
            />
            {errors.description && (
              <p id="description-error" className="mt-1.5 text-sm text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-stone-700">
              Category
            </label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className={fieldClass}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryInfo[c].name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* inputMode="decimal" shows a number keyboard on phones; step lets cents be typed */}
            <TextField label="Price ($)" name="price" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={handleChange} error={errors.price} />
            <TextField
              label="Compare at ($)"
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Optional"
              value={form.compareAtPrice}
              onChange={handleChange}
              error={errors.compareAtPrice}
            />
            <TextField label="Stock" name="stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock} onChange={handleChange} error={errors.stock} />
          </div>
          <p className="-mt-2 text-xs text-stone-500">"Compare at" is the old price. Set it to show the product as on sale.</p>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-stone-700">
              Image URLs <span className="font-normal text-stone-500">(one per line, the first is the main image)</span>
            </label>
            <textarea
              id="images"
              name="images"
              rows={3}
              placeholder="https://cdn.dummyjson.com/product-images/..."
              value={form.images}
              onChange={handleChange}
              aria-invalid={errors.images ? true : undefined}
              aria-describedby={errors.images ? 'images-error' : undefined}
              className={`${fieldClass} font-mono text-xs`}
            />
            {errors.images && (
              <p id="images-error" className="mt-1.5 text-sm text-red-600">
                {errors.images}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Saving…' : 'Publish product'}
          </Button>
        </form>

        {/* 4. LIVE PREVIEW: derived from the form state on every keystroke, no extra state needed. */}
        <aside className="lg:col-span-5">
          <p className="text-sm font-medium text-stone-700">Preview</p>
          <div className="mt-2 aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="size-full object-contain p-6 mix-blend-multiply" />
            ) : (
              <div className="grid size-full place-items-center text-sm text-stone-400">Image preview</div>
            )}
          </div>
          <p className="mt-4 text-xs text-stone-500">{categoryInfo[form.category].name}</p>
          <p className="text-sm font-medium">{form.title || 'Product name'}</p>
          <p className="mt-1 text-sm font-semibold">{form.price ? `$${Number(form.price).toFixed(2)}` : '$0.00'}</p>
        </aside>
      </div>
    </Container>
  )
}

export default NewProductPage
