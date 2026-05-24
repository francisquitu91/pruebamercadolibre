import { PaymentRequest, PaymentResponse } from '@/types'

const EDGE_FUNCTION_URL = import.meta.env.VITE_EDGE_FUNCTION_URL || 
  'https://bgugepseqlyffrtfkepo.supabase.co/functions/v1'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export async function createPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/create-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create payment')
  }

  return response.json()
}

export async function getOrderStatus(orderId: string): Promise<string> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/order-status?order_id=${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch order status')
  }

  const data = await response.json()
  return data.status
}
