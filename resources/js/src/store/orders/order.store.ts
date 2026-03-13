import { create } from "zustand"
import { Order, CreateOrderInput, OrderResponse, OrderListResponse } from "../../domains/orders/orders.types"
import { getOrders, createOrder } from "../../domains/orders/orders.services"

interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  isLoading: boolean
  error: string | null

  fetchOrders: () => Promise<void>
  addOrder: (input: CreateOrderInput) => Promise<OrderResponse>
  selectOrder: (order: Order | null) => void
  clearError: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: OrderListResponse = await getOrders()
      if (response.success) {
        set({ orders: response.data, isLoading: false })
      } else {
        set({ error: response.message || "Failed to fetch orders", isLoading: false })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An error occurred", isLoading: false })
    }
  },

  addOrder: async (input: CreateOrderInput) => {
    set({ isLoading: true, error: null })
    try {
      const response: OrderResponse = await createOrder(input)
      if (response.success && response.data) {
        set((state) => ({
          orders: [...state.orders, response.data!],
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

  selectOrder: (order: Order | null) => {
    set({ selectedOrder: order })
  },

  clearError: () => {
    set({ error: null })
  },
}))
