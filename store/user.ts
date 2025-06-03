import { create } from 'zustand'

export interface User {
  id: number
  username: string
  email: string
  password?: string
}

interface UserState {
  users: User[]
  currentUser: User | null
  isLoading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers: () => Promise<void>
  fetchUser: (id: number) => Promise<void>
  createUser: (userData: Omit<User, 'id'>) => Promise<void>
  updateUser: (id: number, userData: Partial<User>) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  setCurrentUser: (user: User | null) => void
  clearError: () => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('https://fakestoreapi.com/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      set({ users: data, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        isLoading: false,
      })
    }
  },

  fetchUser: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      const data = await response.json()
      set({ currentUser: data, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        isLoading: false,
      })
    }
  },

  createUser: async (userData: Omit<User, 'id'>) => {
    set({ isLoading: true, error: null })
    try {
      // First, check if username already exists
      const usersResponse = await fetch('https://fakestoreapi.com/users')
      const existingUsers = await usersResponse.json()
      const existingUser = existingUsers.find((u: User) => u.username === userData.username)

      if (existingUser) {
        throw new Error('Username already exists')
      }

      // Create new user with proper JSON structure
      const userPayload = {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        name: {
          firstname: userData.username,
          lastname: 'User'
        },
        address: {
          city: 'City',
          street: 'Street',
          number: 1,
          zipcode: '12345',
          geolocation: {
            lat: '0',
            long: '0'
          }
        },
        phone: '1234567890'
      }

      const response = await fetch('https://fakestoreapi.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userPayload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create user' }))
        throw new Error(errorData.message || 'Failed to create user')
      }

      const data = await response.json()
      set((state) => ({
        users: [...state.users, data],
        isLoading: false,
      }))

      return data
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create user',
        isLoading: false,
      })
      throw error
    }
  },

  updateUser: async (id: number, userData: Partial<User>) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...userData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user')
      }

      const data = await response.json()
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...data } : user
        ),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update user',
        isLoading: false,
      })
      throw error
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`https://fakestoreapi.com/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete user')
      }

      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        currentUser: state.currentUser?.id === id ? null : state.currentUser,
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete user',
        isLoading: false,
      })
      throw error
    }
  },

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user })
  },

  clearError: () => {
    set({ error: null })
  },
})) 