import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

type Props = {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
}

function Rating({ rating, reviewCount, size = 'sm' }: Props) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4.5'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              iconSize,
              i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200',
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className={cn('text-stone-500', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)} ({reviewCount})
        </span>
      )}
    </div>
  )
}

export default Rating
