import { CheckoutForm } from '@/components/CheckoutForm'

export function CheckoutPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
