export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface CreateUserInput {
  name: string
  email: string
}

export interface UserResponse {
  success: boolean
  data?: User
  message?: string
}

export interface UserListResponse {
  success: boolean
  data: User[]
  message?: string
}
