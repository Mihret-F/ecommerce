import { create } from 'zustand'
import { Product } from '@/types/product'

interface FilterState {
  searchQuery: string
  category: string
  minPrice: number
  maxPrice: number
  sortBy: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  setSearchQuery: (query: string) => void
  setCategory: (category: string) => void
  setPriceRange: (min: number, max: number) => void
  setSortBy: (sort: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc') => void
  resetFilters: () => void
  filterProducts: (products: Product[]) => Product[]
}

export const useFilterStore = create<FilterState>((set, get) => ({
  searchQuery: '',
  category: '',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'price-asc',

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setCategory: (category: string) => set({ category }),
  setPriceRange: (min: number, max: number) => set({ minPrice: min, maxPrice: max }),
  setSortBy: (sort: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc') => set({ sortBy: sort }),
  resetFilters: () => set({
    searchQuery: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'price-asc',
  }),

  filterProducts: (products: Product[]) => {
    const { searchQuery, category, minPrice, maxPrice, sortBy } = get()

    return products
      .filter((product) => {
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !category || product.category === category
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice

        return matchesSearch && matchesCategory && matchesPrice
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'name-asc':
            return a.title.localeCompare(b.title)
          case 'name-desc':
            return b.title.localeCompare(a.title)
          default:
            return 0
        }
      })
  },
})) 