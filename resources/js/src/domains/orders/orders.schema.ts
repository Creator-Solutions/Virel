import { z } from "zod"

export const orderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  total_amount: z.number().positive(),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
  created_at: z.string().datetime(),
})

export const createOrderSchema = orderSchema.omit({
  id: true,
  created_at: true,
})

export type Order = z.infer<typeof orderSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const orderResponseSchema = z.object({
  success: z.boolean(),
  data: orderSchema.optional(),
  message: z.string().optional(),
})

export type OrderResponse = z.infer<typeof orderResponseSchema>

export const orderListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(orderSchema),
})
