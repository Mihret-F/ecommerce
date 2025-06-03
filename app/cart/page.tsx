'use client'

import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CHAPA_SECRET_KEY = 'CHASECK_TEST-TwRKAl0xcmGDc0JGaCLPQgPySEsvjLqQ'
const CHAPA_BASE_URL = 'https://api.chapa.co/v1'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer' | 'chapa'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  total: number
  onCheckout: (paymentMethod: PaymentMethod, details?: any) => void
  paymentDetails: {
    chapa: {
      first_name: string
      last_name: string
      phone: string
      email: string
    }
    card: {
      number: string
      name: string
      expiry: string
      cvv: string
    }
  }
  onPaymentDetailsChange: (method: 'chapa' | 'card', details: any) => void
}

function CheckoutModal({ 
  isOpen, 
  onClose, 
  total, 
  onCheckout,
  paymentDetails,
  onPaymentDetailsChange
}: CheckoutModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit_card')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateChapaDetails = () => {
    const { first_name, last_name, phone, email } = paymentDetails.chapa
    if (!first_name.trim()) {
      setError('First name is required')
      return false
    }
    if (!last_name.trim()) {
      setError('Last name is required')
      return false
    }
    if (!phone.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      setError('Please enter a valid phone number')
      return false
    }
    return true
  }

  const validateCardDetails = () => {
    const { number, name, expiry, cvv } = paymentDetails.card
    if (!number.trim()) {
      setError('Card number is required')
      return false
    }
    if (!name.trim()) {
      setError('Cardholder name is required')
      return false
    }
    if (!expiry.trim()) {
      setError('Expiry date is required')
      return false
    }
    if (!cvv.trim()) {
      setError('CVV is required')
      return false
    }
    if (!/^\d{16}$/.test(number.replace(/\s+/g, ''))) {
      setError('Please enter a valid 16-digit card number')
      return false
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Please enter a valid expiry date (MM/YY)')
      return false
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError('Please enter a valid CVV')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      if (selectedPayment === 'chapa') {
        if (!validateChapaDetails()) {
          return
        }
        onCheckout(selectedPayment, paymentDetails.chapa)
      } else if (selectedPayment === 'credit_card') {
        if (!validateCardDetails()) {
          return
        }
        onCheckout(selectedPayment)
      } else {
        onCheckout(selectedPayment)
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      setError('An error occurred while processing your payment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="credit_card"
                checked={selectedPayment === 'credit_card'}
                onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                selectedPayment === 'credit_card' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
              }`}>
                {selectedPayment === 'credit_card' && (
                  <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-sm text-center">Credit Card</span>
            </label>

            <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={selectedPayment === 'paypal'}
                onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                selectedPayment === 'paypal' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
              }`}>
                {selectedPayment === 'paypal' && (
                  <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-sm text-center">PayPal</span>
            </label>

            <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="bank_transfer"
                checked={selectedPayment === 'bank_transfer'}
                onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                selectedPayment === 'bank_transfer' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
              }`}>
                {selectedPayment === 'bank_transfer' && (
                  <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-sm text-center">Bank Transfer</span>
            </label>

            <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="payment"
                value="chapa"
                checked={selectedPayment === 'chapa'}
                onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 ${
                selectedPayment === 'chapa' ? 'border-primary-600 bg-primary-50' : 'border-gray-300'
              }`}>
                {selectedPayment === 'chapa' && (
                  <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                )}
              </div>
              <span className="text-sm text-center">Chapa</span>
            </label>
          </div>
        </div>

        {selectedPayment === 'credit_card' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentDetails.card.number}
                onChange={(e) => onPaymentDetailsChange('card', { ...paymentDetails.card, number: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentDetails.card.name}
                onChange={(e) => onPaymentDetailsChange('card', { ...paymentDetails.card, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.card.expiry}
                  onChange={(e) => onPaymentDetailsChange('card', { ...paymentDetails.card, expiry: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentDetails.card.cvv}
                  onChange={(e) => onPaymentDetailsChange('card', { ...paymentDetails.card, cvv: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {selectedPayment === 'chapa' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  value={paymentDetails.chapa.first_name}
                  onChange={(e) => onPaymentDetailsChange('chapa', { ...paymentDetails.chapa, first_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={paymentDetails.chapa.last_name}
                  onChange={(e) => onPaymentDetailsChange('chapa', { ...paymentDetails.chapa, last_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+251 9XXXXXXXX"
                value={paymentDetails.chapa.phone}
                onChange={(e) => onPaymentDetailsChange('chapa', { ...paymentDetails.chapa, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={paymentDetails.chapa.email}
                onChange={(e) => onPaymentDetailsChange('chapa', { ...paymentDetails.chapa, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                After clicking "Pay Now", you will be redirected to Chapa's secure payment page to complete your transaction.
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState({
    chapa: {
      first_name: '',
      last_name: '',
      phone: '',
      email: ''
    },
    card: {
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    }
  })

  const handlePaymentDetailsChange = (method: 'chapa' | 'card', details: any) => {
    setPaymentDetails(prev => ({
      ...prev,
      [method]: details
    }))
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckout = async (paymentMethod: PaymentMethod, details?: any) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setIsProcessing(true)
    setNetworkError(null)
    try {
      if (paymentMethod === 'chapa') {
        // Prepare Chapa payment data
        const tx_ref = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        const paymentData = {
          amount: getTotalPrice().toString(),
          currency: 'ETB',
          email: details.email,
          first_name: details.first_name,
          last_name: details.last_name,
          tx_ref,
          callback_url: `${window.location.origin}/payment/success`,
          return_url: `${window.location.origin}/payment/success`,
          customization: {
            title: 'E-Commerce Store',
            description: 'Payment for your order'
          }
        }

        try {
          // Initialize Chapa payment with retry logic
          const response = await fetchWithRetry(
            `${CHAPA_BASE_URL}/transaction/initialize`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(paymentData)
            }
          )

          const data = await response.json()
          
          if (data.status === 'success' && data.data.checkout_url) {
            // Store the transaction reference in localStorage
            localStorage.setItem('chapa_tx_ref', tx_ref)
            // Redirect to Chapa checkout page
            window.location.href = data.data.checkout_url
          } else {
            throw new Error('Failed to get checkout URL')
          }
        } catch (error) {
          if (error instanceof Error) {
            if (error.message.includes('Failed to fetch')) {
              setNetworkError('Network error: Please check your internet connection and try again.')
            } else {
              setNetworkError(error.message)
            }
          } else {
            setNetworkError('An unexpected error occurred. Please try again.')
          }
          throw error
        }
      } else {
        // Handle other payment methods
        await new Promise(resolve => setTimeout(resolve, 2000))
        console.log('Processing payment with method:', paymentMethod)
        
        // Clear the cart after successful payment
        clearCart()
        setShowCheckout(false)
        
        // Show success message
        alert('Payment successful! Thank you for your purchase.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.'
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
      setIsRetrying(false)
    }
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
    } else {
      setShowCheckout(true)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => {
            if (!item?.product) return null

            return (
              <div
                key={item.product.id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md mb-4"
              >
                <div className="relative w-24 h-24">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.title || 'Product image'}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-2">
                    {item.product.title || 'Untitled Product'}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    ${(item.product.price || 0).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${((item.product.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleProceedToCheckout}
              className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false)
          setNetworkError(null)
        }}
        total={getTotalPrice()}
        onCheckout={handleCheckout}
        paymentDetails={paymentDetails}
        onPaymentDetailsChange={handlePaymentDetailsChange}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to your account to proceed with checkout.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false)
                  router.push('/login')
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Error Modal */}
      {networkError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Connection Error</h3>
              <button
                onClick={() => setNetworkError(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-4">{networkError}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setNetworkError(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setNetworkError(null)
                  setIsRetrying(true)
                  handleCheckout('chapa', paymentDetails.chapa)
                }}
                disabled={isRetrying}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 