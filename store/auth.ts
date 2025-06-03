import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  error: string | null
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,

      login: async (username: string, password: string) => {
        try {
          // First, check if user exists
          const usersResponse = await fetch('https://fakestoreapi.com/users')
          const users = await usersResponse.json()
          const user = users.find((u: User) => u.username === username)

          if (!user) {
            throw new Error('User not found')
          }

          // Attempt to login
          const response = await fetch('https://fakestoreapi.com/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              username,
              password,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }))
            throw new Error(errorData.message || 'Invalid credentials')
          }

          const data = await response.json()

          set({
            token: data.token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
            isAuthenticated: true,
            error: null,
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'An error occurred during login',
            isAuthenticated: false,
            token: null,
            user: null,
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
) 