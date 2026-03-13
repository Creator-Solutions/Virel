import { CreateUserInput, User, UserListResponse, UserResponse } from "./users.types"
import { createUserSchema, userListResponseSchema, userResponseSchema } from "./users.schema"

const API_BASE_URL = "/api"

export async function getUsers(): Promise<UserListResponse> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  return userListResponseSchema.parse(data)
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const validatedInput = createUserSchema.parse(input)

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validatedInput),
  })

  const data = await response.json()
  return userResponseSchema.parse(data)
}
