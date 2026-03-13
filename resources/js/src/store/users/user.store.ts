import { create } from "zustand"
import { User, CreateUserInput, UserResponse, UserListResponse } from "../../domains/users/users.types"
import { getUsers, createUser } from "../../domains/users/users.services"

interface UserState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null

  fetchUsers: () => Promise<void>
  addUser: (input: CreateUserInput) => Promise<UserResponse>
  selectUser: (user: User | null) => void
  clearError: () => void
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: UserListResponse = await getUsers()
      if (response.success) {
        set({ users: response.data, isLoading: false })
      } else {
        set({ error: response.message || "Failed to fetch users", isLoading: false })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An error occurred", isLoading: false })
    }
  },

  addUser: async (input: CreateUserInput) => {
    set({ isLoading: true, error: null })
    try {
      const response: UserResponse = await createUser(input)
      if (response.success && response.data) {
        set((state) => ({
          users: [...state.users, response.data!],
          isLoading: false,
        }))
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  selectUser: (user: User | null) => {
    set({ selectedUser: user })
  },

  clearError: () => {
    set({ error: null })
  },
}))
