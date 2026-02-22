import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface AddToCartButtonProps {
  name: string
  size: string
  option: string
  price: number
  className?: string
  material?: string
  shape?: string
  dimensions?: string
}

export default function AddToCartButton({
  name,
  size,
  option,
  price,
  className = '',
  material,
  shape,
  dimensions,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: `${name}-${size}-${option}-${Date.now()}`,
      name,
      size,
      option,
      price,
      quantity: 1,
      material,
      shape,
      dimensions,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all hover:bg-primary/90 disabled:opacity-70 cursor-pointer ${className}`}
    >
      {added ? (
        <>
          <Check size={16} />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          Add to Cart
        </>
      )}
    </button>
  )
}
