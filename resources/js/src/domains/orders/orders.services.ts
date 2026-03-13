import { CreateOrderInput, Order, OrderListResponse, OrderResponse } from "./orders.types"
import { createOrderSchema, orderListResponseSchema, orderResponseSchema } from "./orders.schema"

const API_BASE_URL = "/api"

export async function getOrders(): Promise<OrderListResponse> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  return orderListResponseSchema.parse(data)
}

export async function createOrder(input: CreateOrderInput): Promise<OrderResponse> {
  const validatedInput = createOrderSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedInput),
  })

  const data = await response.json()
  return orderResponseSchema.parse(data)
}
