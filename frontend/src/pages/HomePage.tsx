import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { getProducts } from '@/services/products'
import { ProductCard } from '@/components/ProductCard'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load products'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center text-gray-600">Loading products...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-12 text-gray-800">Featured Products</h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-600">No products available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
