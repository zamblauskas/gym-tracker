import { useState, useEffect, useCallback } from 'react'
import { IDataRepository } from '@/lib/repositories'

/**
 * Custom hook for persisted state using a repository
 * Loads data from repository on mount and saves on changes
 */
export function usePersistedState<T extends { id: string }>(
  repository: IDataRepository<T>
): [T[], (items: T[]) => void] {
  const [items, setItemsState] = useState<T[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load initial data from repository
  useEffect(() => {
    const loadData = async () => {
      const data = await repository.getAll()
      setItemsState(data)
      setIsLoaded(true)
    }

    loadData()
  }, [repository])

  // Wrapper function that saves to repository when state changes
  const setItems = useCallback(
    (newItems: T[]) => {
      setItemsState(newItems)

      // Save to repository (async, but we don't wait)
      // We could add optimistic updates here
      if (isLoaded) {
        saveToRepository(newItems)
      }
    },
    [isLoaded, repository]
  )

  const saveToRepository = async (items: T[]) => {
    try {
      // Clear and re-save all items
      // This is a simple strategy; could be optimized to track changes
      await repository.clear()
      for (const item of items) {
        await repository.create(item)
      }
    } catch (error) {
      console.error('Error saving to repository:', error)
    }
  }

  return [items, setItems]
}
