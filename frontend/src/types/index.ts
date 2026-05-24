export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  created_at: string
}

export interface CartItem {
  product_id: string
  quantity: number
  product: Product
}

export interface Order {
  id: string
  user_id: string | null
  total: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
  mercadopago_payment_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
}

export interface PaymentRequest {
  items: Array<{
    product_id: string
    quantity: number
  }>
  payer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    documentType: string
    documentNumber: string
  }
}

export interface PaymentResponse {
  order_id: string
  preference_id: string
  init_point: string
}

export interface WebhookPayload {
  id: string
  type: string
  action: string
  data: {
    id: string
  }
}
