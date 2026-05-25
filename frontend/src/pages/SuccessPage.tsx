import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getOrderStatus } from '@/services/payment'

export function SuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<string>('loading')
  const [orderId, setOrderId] = useState<string>('')

  useEffect(() => {
    // Don't poll if status is already final
    if (status !== 'loading') {
      return
    }

    const fetchStatus = async () => {
      try {
        // Get order ID from session storage or URL params
        const id = sessionStorage.getItem('pending_order_id') || searchParams.get('order_id')
        
        if (!id) {
          setStatus('error')
          return
        }

        setOrderId(id)
        const paymentStatus = await getOrderStatus(id)
        setStatus(paymentStatus)
      } catch (error) {
        console.error('Failed to fetch order status:', error)
        setStatus('error')
      }
    }

    // Poll status every 2 seconds
    const timer = setInterval(fetchStatus, 2000)
    
    // Initial fetch after a small delay
    const initialTimer = setTimeout(() => fetchStatus(), 500)
    
    return () => {
      clearInterval(timer)
      clearTimeout(initialTimer)
    }
  }, [searchParams, status])

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we verify your payment.</p>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Approved!</h2>
            <p className="text-gray-600 mb-4">
              Your order has been successfully created.
            </p>
            <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('pending_order_id')
                navigate('/')
              }}
              className="bg-secondary hover:bg-amber-600 text-white font-bold py-2 px-6 rounded"
            >
              Back to Home
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Payment Pending</h2>
            <p className="text-gray-600 mb-4">
              Your payment is being processed. We'll notify you when it's confirmed.
            </p>
            <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-secondary hover:bg-amber-600 text-white font-bold py-2 px-6 rounded"
            >
              Back to Home
            </button>
          </>
        )}

        {(status === 'rejected' || status === 'error' || status === 'cancelled') && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('pending_order_id')
                navigate('/checkout')
              }}
              className="bg-secondary hover:bg-amber-600 text-white font-bold py-2 px-6 rounded"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
