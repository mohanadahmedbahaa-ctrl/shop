import { useState } from 'react'
import { cn } from '../../utils/cn'

type Props = {
  images: string[]
  title: string
}

function ProductGallery({ images, title }: Props) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-3 sm:flex-col">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-current={index === selected ? 'true' : undefined}
              className={cn(
                'size-20 shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-2 transition',
                index === selected ? 'ring-stone-900' : 'ring-transparent hover:ring-stone-300',
              )}
            >
              <img src={src} alt="" className="size-full object-contain p-2 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <div className="aspect-square flex-1 overflow-hidden rounded-3xl bg-stone-100">
        <img
          src={images[selected]}
          alt={title}
          className="size-full object-contain p-10 mix-blend-multiply"
        />
      </div>
    </div>
  )
}

export default ProductGallery
