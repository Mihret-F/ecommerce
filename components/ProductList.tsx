'use client'

import { useQuery } from '@tanstack/react-query'
import ProductCard from './ProductCard'
import { Product } from '@/types'

async function getProducts(): Promise<Product[]> {
  const res = await fetch('https://fakestoreapi.com/products')
  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }
  return res.json()
}

export default function ProductList() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  if (isLoading) {
    return <div className="text-center">Loading products...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading products</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
} 