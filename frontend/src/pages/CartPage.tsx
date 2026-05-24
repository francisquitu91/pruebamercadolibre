import { useCart } from '@/context/cart'
import { CartSidebar } from '@/components/CartSidebar'
import { Link } from 'react-router-dom'

export function CartPage() {
  const items = useCart((state) => state.items)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/"
            className="inline-block bg-secondary hover:bg-amber-600 text-white font-bold py-2 px-6 rounded"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Shopping Cart</h1>
      <CartSidebar />
    </div>
  )
}
