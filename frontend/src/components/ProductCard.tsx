import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/context/cart'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCart((state) => state.addToCart)

  const handleAddToCart = () => {
    if (quantity > 0 && quantity <= product.stock) {
      addToCart(product, quantity)
      setQuantity(1)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-200 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-secondary">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 px-2 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-secondary hover:bg-amber-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
