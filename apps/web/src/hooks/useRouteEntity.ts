import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Custom hook for route-based entity loading with automatic redirect on missing entity
 * Simplifies route wrapper components
 */
export function useRouteEntity<T>(
  entity: T | undefined,
  fallbackPath: string
): T | null {
  const navigate = useNavigate()

  useEffect(() => {
    if (!entity) {
      navigate(fallbackPath)
    }
  }, [entity, fallbackPath, navigate])

  return entity || null
}
