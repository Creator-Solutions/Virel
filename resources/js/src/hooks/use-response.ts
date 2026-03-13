import { useState, useCallback } from "react"

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export function useResponse<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const setLoading = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
  }, [])

  const setData = useCallback((data: T) => {
    setState({ data, error: null, isLoading: false })
  }, [])

  const setError = useCallback((error: string) => {
    setState({ data: null, error, isLoading: false })
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  return {
    ...state,
    setLoading,
    setData,
    setError,
    reset,
  }
}

export function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unexpected error occurred"
}
