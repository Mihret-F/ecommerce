'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types/product'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCartStore()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch product')
        }
        const data = await response.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error || 'Product not found'}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="relative h-96">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-2xl font-bold text-primary-600">${product.price}</span>
            <span className="ml-4 text-sm text-gray-500">Category: {product.category}</span>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-2">{product.rating?.rate || 0}</span>
              <span className="ml-2 text-gray-500">({product.rating?.count || 0} reviews)</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 