import { useState, useEffect, useCallback, useRef } from 'react'
import { IDataRepository } from '@/lib/repositories'
import { useErrors } from '@/contexts/ErrorContext'
import { deepEqual } from '@/lib/utils/deepEqual'
import { logger } from '@/lib/utils/logger'

/**
 * Custom hook for persisted state using a repository
 * Loads data from repository on mount and saves on changes
 * Uses delta tracking to optimize sync operations
 * Includes proper async handling and error recovery
 */
export function usePersistedState<T extends { id: string }>(
  repository: IDataRepository<T>
): [T[], (items: T[]) => void, boolean] {
  const [items, setItemsState] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const previousItemsRef = useRef<Map<string, T>>(new Map())
  const saveInProgressRef = useRef(false)
  const pendingSaveRef = useRef<T[] | null>(null)
  const { addError } = useErrors()

  // Load initial data from repository
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await repository.getAll()
        setItemsState(data)

        // Initialize previous items map for delta tracking
        const itemsMap = new Map<string, T>()
        data.forEach(item => itemsMap.set(item.id, item))
        previousItemsRef.current = itemsMap
      } catch (error) {
        addError('Failed to load data', error instanceof Error ? error.message : undefined)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [repository, addError])

  // Wrapper function that saves to repository when state changes
  const setItems = useCallback(
    (newItems: T[]) => {
      const previousItems = previousItemsRef.current

      // Update state optimistically
      setItemsState(newItems)

      // Save to repository if not currently loading
      if (!isLoading) {
        // If a save is already in progress, queue this update
        if (saveInProgressRef.current) {
          pendingSaveRef.current = newItems
        } else {
          saveToRepository(newItems, previousItems)
        }
      }
    },
    [isLoading, repository, addError]
  )

  const saveToRepository = async (newItems: T[], previousItems: Map<string, T>) => {
    saveInProgressRef.current = true

    try {
      const newItemsMap = new Map<string, T>()
      newItems.forEach(item => newItemsMap.set(item.id, item))

      // Detect changes (add, update, delete)
      const toCreate: T[] = []
      const toUpdate: T[] = []
      const toDelete: string[] = []

      // Find new and updated items using deep equality
      for (const item of newItems) {
        const previousItem = previousItems.get(item.id)
        if (!previousItem) {
          toCreate.push(item)
        } else if (!deepEqual(item, previousItem)) {
          toUpdate.push(item)
        }
      }

      // Find deleted items
      for (const [id, _] of previousItems) {
        if (!newItemsMap.has(id)) {
          toDelete.push(id)
        }
      }

      // Apply changes in order: delete, update, create
      const promises: Promise<any>[] = []

      toDelete.forEach(id => promises.push(repository.delete(id)))
      toUpdate.forEach(item => promises.push(repository.update(item.id, item)))
      toCreate.forEach(item => promises.push(repository.create(item)))

      await Promise.all(promises)

      // Update the previous items map only after successful save
      previousItemsRef.current = newItemsMap
    } catch (error) {
      logger.error('Error saving to repository', error, 'usePersistedState')
      addError('Failed to save changes', error instanceof Error ? error.message : undefined)

      // Rollback optimistic update on failure
      setItemsState(Array.from(previousItems.values()))
    } finally {
      saveInProgressRef.current = false

      // Process any pending save
      if (pendingSaveRef.current) {
        const pending = pendingSaveRef.current
        pendingSaveRef.current = null
        saveToRepository(pending, previousItemsRef.current)
      }
    }
  }

  return [items, setItems, isLoading]
}
