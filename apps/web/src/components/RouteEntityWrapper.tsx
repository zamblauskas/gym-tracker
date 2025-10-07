import { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { useRouteEntity } from '@/hooks/useRouteEntity'

interface RouteEntityWrapperProps<T> {
  /**
   * Array of entities to search through
   */
  entities: T[]

  /**
   * Function to extract ID from route params
   */
  getIdFromParams: (params: Record<string, string | undefined>) => string | undefined

  /**
   * Path to redirect to if entity not found
   */
  fallbackPath: string

  /**
   * Render function that receives the found entity and params
   */
  render: (entity: T, params: Record<string, string | undefined>) => ReactElement | null

  /**
   * Optional filter function to find the entity
   * Defaults to matching by 'id' property
   */
  findEntity?: (entities: T[], id: string) => T | undefined
}

/**
 * Generic route wrapper component that eliminates repetitive route wrapper patterns
 * Handles: useParams → find entity → useRouteEntity → render
 */
export function RouteEntityWrapper<T extends { id: string }>({
  entities,
  getIdFromParams,
  fallbackPath,
  render,
  findEntity,
}: RouteEntityWrapperProps<T>) {
  const params = useParams()
  const id = getIdFromParams(params)

  const defaultFindEntity = (entities: T[], id: string) =>
    entities.find(entity => entity.id === id)

  const finder = findEntity || defaultFindEntity
  const entity = useRouteEntity(
    id ? finder(entities, id) : undefined,
    fallbackPath
  )

  if (!entity) return null

  return render(entity, params)
}
