import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { HomePage } from '@/pages/HomePage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { SuccessPage } from '@/pages/SuccessPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
