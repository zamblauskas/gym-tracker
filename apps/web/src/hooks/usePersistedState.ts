import { useState, useEffect, useCallback, useRef } from 'react'
import { IDataRepository } from '@/lib/repositories'

/**
 * Custom hook for persisted state using a repository
 * Loads data from repository on mount and saves on changes
 * Uses delta tracking to optimize sync operations
 */
export function usePersistedState<T extends { id: string }>(
  repository: IDataRepository<T>
): [T[], (items: T[]) => void, boolean] {
  const [items, setItemsState] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const previousItemsRef = useRef<Map<string, T>>(new Map())

  // Load initial data from repository
  useEffect(() => {
    const loadData = async () => {
      const data = await repository.getAll()
      setItemsState(data)
      setIsLoading(false)

      // Initialize previous items map for delta tracking
      const itemsMap = new Map<string, T>()
      data.forEach(item => itemsMap.set(item.id, item))
      previousItemsRef.current = itemsMap
    }

    loadData()
  }, [repository])

  // Wrapper function that saves to repository when state changes
  const setItems = useCallback(
    (newItems: T[]) => {
      const previousItems = previousItemsRef.current

      // Update state optimistically
      setItemsState(newItems)

      // Save to repository (async, but we don't wait)
      if (!isLoading) {
        saveToRepository(newItems, previousItems)

        // Update the previous items map
        const newItemsMap = new Map<string, T>()
        newItems.forEach(item => newItemsMap.set(item.id, item))
        previousItemsRef.current = newItemsMap
      }
    },
    [isLoading, repository]
  )

  const saveToRepository = async (newItems: T[], previousItems: Map<string, T>) => {
    try {
      const newItemsMap = new Map<string, T>()
      newItems.forEach(item => newItemsMap.set(item.id, item))

      // Detect changes (add, update, delete)
      const toCreate: T[] = []
      const toUpdate: T[] = []
      const toDelete: string[] = []

      // Find new and updated items
      for (const item of newItems) {
        const previousItem = previousItems.get(item.id)
        if (!previousItem) {
          toCreate.push(item)
        } else if (JSON.stringify(item) !== JSON.stringify(previousItem)) {
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
    } catch (error) {
      console.error('Error saving to repository:', error)
    }
  }

  return [items, setItems, isLoading]
}
