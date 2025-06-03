'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`/?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort) {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <select
        onChange={(e) => handleFilterChange(e.target.value)}
        value={searchParams.get('category') || ''}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="jewelery">Jewelery</option>
        <option value="men's clothing">Men's Clothing</option>
        <option value="women's clothing">Women's Clothing</option>
      </select>

      <select
        onChange={(e) => handleSortChange(e.target.value)}
        value={searchParams.get('sort') || ''}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Sort By</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  )
} 