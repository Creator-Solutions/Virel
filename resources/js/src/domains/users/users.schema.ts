import { z } from "zod"

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  created_at: z.string().datetime(),
})

export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
})

export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>

export const userResponseSchema = z.object({
  success: z.boolean(),
  data: userSchema.optional(),
  message: z.string().optional(),
})

export type UserResponse = z.infer<typeof userResponseSchema>

export const userListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userSchema),
})
