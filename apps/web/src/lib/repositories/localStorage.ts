import { IDataRepository } from './types'

/**
 * LocalStorage implementation of the data repository
 * Handles serialization/deserialization including Date objects
 */
export class LocalStorageRepository<T extends { id: string }> implements IDataRepository<T> {
  private readonly storageKey: string

  constructor(storageKey: string) {
    this.storageKey = `gym-tracker:${storageKey}`
  }

  async getAll(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (!data) return []

      const items = JSON.parse(data)
      return items.map((item: any) => this.deserializeDates(item))
    } catch (error) {
      console.error(`Error reading from localStorage (${this.storageKey}):`, error)
      return []
    }
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getAll()
    return items.find(item => item.id === id) || null
  }

  async create(item: T): Promise<T> {
    const items = await this.getAll()
    items.push(item)
    await this.saveAll(items)
    return item
  }

  async update(id: string, item: T): Promise<T> {
    const items = await this.getAll()
    const index = items.findIndex(i => i.id === id)

    if (index === -1) {
      throw new Error(`Item with id ${id} not found`)
    }

    items[index] = item
    await this.saveAll(items)
    return item
  }

  async delete(id: string): Promise<void> {
    const items = await this.getAll()
    const filtered = items.filter(item => item.id !== id)
    await this.saveAll(filtered)
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey)
  }

  private async saveAll(items: T[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    } catch (error) {
      console.error(`Error writing to localStorage (${this.storageKey}):`, error)
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
