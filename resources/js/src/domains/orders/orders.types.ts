export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: "pending" | "processing" | "completed" | "cancelled"
  created_at: string
}

export interface CreateOrderInput {
  user_id: string
  total_amount: number
  status?: "pending" | "processing" | "completed" | "cancelled"
}

export interface OrderResponse {
  success: boolean
  data?: Order
  message?: string
}

export interface OrderListResponse {
  success: boolean
  data: Order[]
  message?: string
}
