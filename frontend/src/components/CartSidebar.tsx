import { useCart } from '@/context/cart'
import { Link } from 'react-router-dom'

export function CartSidebar() {
  const items = useCart((state) => state.items)
  const removeFromCart = useCart((state) => state.removeFromCart)
  const updateQuantity = useCart((state) => state.updateQuantity)
  const total = useCart((state) => state.getTotal())
  const itemCount = useCart((state) => state.getItemCount())

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product_id} className="flex gap-4 pb-4 border-b">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                  <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)}</p>

                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = Math.max(1, parseInt(e.target.value) || 1)
                        if (qty <= item.product.stock) {
                          updateQuantity(item.product_id, qty)
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">{itemCount} items</p>

            <Link
              to="/checkout"
              className="block w-full bg-secondary hover:bg-amber-600 text-white font-bold py-3 px-4 rounded text-center transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
