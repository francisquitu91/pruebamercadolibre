import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/cart'
import { createPayment } from '@/services/payment'
import { PaymentResponse } from '@/types'

declare global {
  interface Window {
    MercadoPago: any
  }
}

export function CheckoutForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('francisco@example.com')
  const [formData, setFormData] = useState({
    firstName: 'Francisco',
    lastName: 'Javier',
    email: 'francisco@example.com',
    phone: '+56967542200',
    documentType: 'DNI',
    documentNumber: 'ADAWE23131331',
  })
  const items = useCart((state) => state.items)
  const total = useCart((state) => state.getTotal())
  const bricksContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Mercado Pago SDK for Bricks
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!formData.email || items.length === 0) {
      setError('Please enter email and add items to cart')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const paymentRequest = {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
        },
      }

      const response: PaymentResponse = await createPayment(paymentRequest)
      
      // Store order ID and preference ID for later reference
      sessionStorage.setItem('pending_order_id', response.order_id)
      sessionStorage.setItem('preference_id', response.preference_id)
      
      // Initialize Mercado Pago Bricks (if available)
      if (window.MercadoPago) {
        const mp = new window.MercadoPago('TEST-37f92d37-7c4d-4215-a1a1-06de62c445c5')
        
        // Redirect to Mercado Pago checkout (compatible con Bricks)
        window.location.href = response.init_point
      } else {
        // Fallback to simple redirect if SDK not loaded
        window.location.href = response.init_point
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initialization failed'
      setError(message)
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Also update email state for backwards compatibility
    if (name === 'email') {
      setEmail(value)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate('/')}
          className="bg-secondary hover:bg-amber-600 text-white font-bold py-2 px-6 rounded"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-8">Checkout</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Lado izquierdo: Resumen de orden */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-4 border-b">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-gray-700">
                <span className="flex-1">
                  {item.product.name} <span className="text-gray-500">x{item.quantity}</span>
                </span>
                <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-xl font-bold text-gray-800">
              <span>Total:</span>
              <span className="text-secondary">${total.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{items.length} product(s)</p>
          </div>
        </div>

        {/* Lado derecho: Formulario */}
        <div>
          <h3 className="text-lg font-semibold mb-4 pb-4 border-b">Billing Information</h3>
          <form className="space-y-4">
            {/* Primera fila: Nombres */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+54 9 11 1234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
              />
            </div>

            {/* Documento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Document Type</label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
                >
                  <option value="DNI">DNI</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Document Number</label>
                <input
                  type="text"
                  name="documentNumber"
                  value={formData.documentNumber}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-secondary text-sm"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">* Required fields</p>
          </form>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handlePayment}
          disabled={loading || !formData.email}
          className="w-full bg-secondary hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded transition-colors text-lg"
        >
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)} with Mercado Pago`}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded transition-colors"
        >
          Continue Shopping
        </button>

        <p className="text-xs text-gray-500 text-center">
          💳 Safe & Secure • Powered by Mercado Pago Checkout Bricks
        </p>
      </div>
    </div>
  )
}
