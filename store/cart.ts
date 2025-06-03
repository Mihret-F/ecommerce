import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types/product'

interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product: Product) => {
        if (!product || !product.id) {
          console.error('Invalid product data:', product)
          return
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product?.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product?.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          // Create a new cart item with the complete product data
          const newItem: CartItem = {
            product: {
              id: product.id,
              title: product.title || 'Untitled Product',
              price: product.price || 0,
              description: product.description || '',
              category: product.category || '',
              image: product.image || '',
              rating: product.rating || { rate: 0, count: 0 },
            },
            quantity: 1,
          }

          return {
            items: [...state.items, newItem],
          }
        })
      },

      removeFromCart: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.product?.id !== productId),
        }))
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity < 1) return

        set((state) => ({
          items: state.items.map((item) =>
            item.product?.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => {
          if (!item || !item.quantity) return total
          return total + item.quantity
        }, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          if (!item?.product?.price || !item.quantity) return total
          return total + item.product.price * item.quantity
        }, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        // Clear any persisted items on initialization
        if (state) {
          state.clearCart()
        }
      },
    }
  )
) 