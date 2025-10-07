import { IDataRepository } from './types'
import { logger } from '@/lib/utils/logger'

/**
 * LocalStorage implementation of the data repository
 * Handles serialization/deserialization including Date objects
 */
export class LocalStorageRepository<T extends { id: string }> implements IDataRepository<T> {
  private readonly storageKey: string

  constructor(storageKey: string) {
    this.storageKey = `gym-tracker:${storageKey}`
  }

  getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return Promise.resolve([])

      const items = JSON.parse(data)
      return Promise.resolve(items.map((item: any) => this.deserializeDates(item)))
    } catch (error) {
      logger.error(`Error reading from localStorage (${this.storageKey})`, error, 'LocalStorageRepository')
      return Promise.reject(new Error(`Failed to load data from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  }

  getById(id: string): Promise<T | null> {
    const items = this.getAllSync()
    return Promise.resolve(items.find(item => item.id === id) || null)
  }

  create(item: T): Promise<T> {
    const items = this.getAllSync()
    items.push(item)
    this.saveAllSync(items)
    return Promise.resolve(item)
  }

  update(id: string, item: T): Promise<T> {
    const items = this.getAllSync()
    const index = items.findIndex(i => i.id === id)

    if (index === -1) {
      return Promise.reject(new Error(`Item with id ${id} not found`))
    }

    items[index] = item
    this.saveAllSync(items)
    return Promise.resolve(item)
  }

  delete(id: string): Promise<void> {
    const items = this.getAllSync()
    const filtered = items.filter(item => item.id !== id)
    this.saveAllSync(filtered)
    return Promise.resolve()
  }

  clear(): Promise<void> {
    localStorage.removeItem(this.storageKey)
    return Promise.resolve()
  }

  batchCreate(items: T[]): Promise<T[]> {
    const existingItems = this.getAllSync()
    const newItems = [...existingItems, ...items]
    this.saveAllSync(newItems)
    return Promise.resolve(items)
  }

  batchUpdate(items: T[]): Promise<T[]> {
    const existingItems = this.getAllSync()
    const itemMap = new Map(items.map(item => [item.id, item]))

    const updatedItems = existingItems.map(existing =>
      itemMap.has(existing.id) ? itemMap.get(existing.id)! : existing
    )

    this.saveAllSync(updatedItems)
    return Promise.resolve(items)
  }

  batchDelete(ids: string[]): Promise<void> {
    const existingItems = this.getAllSync()
    const idsSet = new Set(ids)
    const filtered = existingItems.filter(item => !idsSet.has(item.id))
    this.saveAllSync(filtered)
    return Promise.resolve()
  }

  // Synchronous private methods for internal use
  private getAllSync(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return []

      const items = JSON.parse(data)
      return items.map((item: any) => this.deserializeDates(item))
    } catch (error) {
      logger.error(`Error reading from localStorage (${this.storageKey})`, error, 'LocalStorageRepository')
      throw new Error(`Failed to read from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private saveAllSync(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    } catch (error) {
      logger.error(`Error writing to localStorage (${this.storageKey})`, error, 'LocalStorageRepository')
      throw error
    }
  }

  /**
   * Recursively deserialize Date objects from JSON
   * Converts ISO date strings back to Date objects
   */
  private deserializeDates(obj: any): any {
    if (obj === null || obj === undefined) return obj

    // Check if it's a date string (ISO 8601 format)
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj)
    }

    // Recursively process objects
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(item => this.deserializeDates(item))
      }

      const result: any = {}
      for (const key in obj) {
        result[key] = this.deserializeDates(obj[key])
      }
      return result
    }

    return obj
  }
}
