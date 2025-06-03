'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilterStore } from '@/store/filter'
import { useCartStore } from '@/store/cart'
import { Product } from '@/types/product'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showModal, setShowModal] = useState(false)
  const searchParams = useSearchParams()
  const { addToCart } = useCartStore()
  const {
    searchQuery,
    category,
    minPrice,
    maxPrice,
    sortBy,
    setSearchQuery,
    setCategory,
    setPriceRange,
    setSortBy,
    resetFilters,
    filterProducts,
  } = useFilterStore()

  // Sync URL parameters with filter store
  useEffect(() => {
    const query = searchParams.get('q')
    const categoryParam = searchParams.get('category')
    const sortParam = searchParams.get('sort')
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')

    if (query) setSearchQuery(query)
    if (categoryParam) setCategory(categoryParam)
    if (sortParam) setSortBy(sortParam as any)
    if (minPriceParam) setPriceRange(Number(minPriceParam), maxPrice)
    if (maxPriceParam) setPriceRange(minPrice, Number(maxPriceParam))
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        setProducts(data)
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((p: Product) => p.category))
        ) as string[]
        setCategories(uniqueCategories)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
    try {
      addToCart(product)
      setToastMessage(`${product.title} added to cart!`)
      setShowToast(true)
      setShowModal(false)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      setToastMessage('Failed to add item to cart')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const filteredProducts = filterProducts(products)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Product Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedProduct.title}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-64">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      ${selectedProduct.price}
                    </span>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Category: </span>
                    <span className="capitalize">{selectedProduct.category}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Rating: </span>
                    <span>{selectedProduct.rating?.rate} ({selectedProduct.rating?.count} reviews)</span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={() => window.location.href = `/product/${selectedProduct.id}`}
                      className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setPriceRange(Number(e.target.value), maxPrice)}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setPriceRange(minPrice, Number(e.target.value))}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-gray-600 mb-4">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2 line-clamp-2">{product.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">${product.price}</span>
                <button
                  onClick={() => openProductModal(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found matching your criteria.</p>
          <button
            onClick={resetFilters}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </main>
  )
} 