import { Link } from 'react-router-dom'
import { useCart } from '@/context/cart'

export function Navbar() {
  const itemCount = useCart((state) => state.getItemCount())

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-secondary transition-colors">
          🛍️ EComm
        </Link>

        <div className="flex gap-6 items-center">
          <Link
            to="/"
            className="hover:text-secondary transition-colors font-semibold"
          >
            Shop
          </Link>

          <Link
            to="/cart"
            className="relative hover:text-secondary transition-colors font-semibold"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
