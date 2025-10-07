import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface AppError {
  id: string
  message: string
  details?: string
  timestamp: Date
}

interface ErrorContextValue {
  errors: AppError[]
  addError: (message: string, details?: string) => void
  clearError: (id: string) => void
  clearAllErrors: () => void
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined)

interface ErrorProviderProps {
  children: ReactNode
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([])

  const addError = useCallback((message: string, details?: string) => {
    const error: AppError = {
      id: `error-${Date.now()}-${Math.random()}`,
      message,
      details,
      timestamp: new Date(),
    }

    setErrors(prev => [...prev, error])

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e.id !== error.id))
    }, 5000)
  }, [])

  const clearError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  return (
    <ErrorContext.Provider value={{ errors, addError, clearError, clearAllErrors }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrors(): ErrorContextValue {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrors must be used within ErrorProvider')
  }
  return context
}
