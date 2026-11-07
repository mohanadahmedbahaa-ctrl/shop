// 1. Import the Product TYPE (not a value) from our data file.
//    `import type` tells TypeScript this is only used for type-checking,
//    so it is removed from the final JavaScript bundle.
import type { Product } from '../data/products'

// 2. Describe the PROPS this component accepts.
//    Props are like function arguments for a component.
//    Here the parent must pass exactly one prop: `product`, shaped like a Product.
type Props = {
  product: Product
}

// 3. A component is just a function that returns JSX.
//    Its name MUST start with a capital letter (ProductCard, not productCard),
//    otherwise React treats <productCard /> as a plain HTML tag.
//
//    `{ product }: Props` is destructuring: React passes one object
//    (props = { product: {...} }) and we pull `product` straight out of it.
function ProductCard({ product }: Props) {
  // 4. Return JSX: HTML-like syntax that compiles to JavaScript.
  //    - Use `className` instead of `class` (`class` is a reserved word in JS).
  //    - Curly braces { } let you put any JavaScript expression inside JSX.
  return (
    // Card wrapper. Tailwind classes:
    // bg-white = white background, rounded-lg = rounded corners,
    // shadow = drop shadow, p-4 = padding, flex flex-col = stack children vertically
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      {/* 5. This is how you write a comment INSIDE JSX: braces + slash-star. */}

      {/* Image: `src` and `alt` come from the product object.
          w-full = full card width, h-48 = fixed height,
          object-cover = crop the image instead of stretching it. */}
      <img
        src={product.image}
        alt={product.title}
        className="w-full h-48 object-cover rounded"
      />

      {/* Category label: small grey uppercase text. */}
      <p className="mt-3 text-xs uppercase text-gray-500">{product.category}</p>

      {/* Title. */}
      <h2 className="text-lg font-semibold">{product.title}</h2>

      {/* 6. Price: `.toFixed(2)` is plain JavaScript and always shows
          2 decimals, so 59 becomes "59.00". Any JS expression works inside { }. */}
      <p className="text-blue-600 font-bold">${product.price.toFixed(2)}</p>

      {/* 7. Event handling: `onClick` takes a FUNCTION. It doesn't take a function call.
          ✅ onClick={() => doSomething()} runs when the button is clicked.
          ❌ onClick={doSomething()} runs immediately on every render.
          For now it just logs; in the cart step we'll replace this with real logic.
          The wrapper's mt-auto pushes the button to the bottom so all cards line up.
          hover:bg-blue-700 = darker blue when the mouse is over it. */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => console.log('Add to cart:', product.title)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}

// 8. Export it so other files (App.tsx) can import and use it.
export default ProductCard
