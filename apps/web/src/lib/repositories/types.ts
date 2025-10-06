/**
 * Generic repository interface for data persistence
 * This interface will be implemented by different storage backends (localStorage, Supabase, etc.)
 */
export interface IDataRepository<T> {
  /**
   * Get all items
   */
  getAll(): Promise<T[]>

  /**
   * Get a single item by ID
   */
  getById(id: string): Promise<T | null>

  /**
   * Create a new item
   */
  create(item: T): Promise<T>

  /**
   * Update an existing item
   */
  update(id: string, item: T): Promise<T>

  /**
   * Delete an item by ID
   */
  delete(id: string): Promise<void>

  /**
   * Clear all items (useful for testing/reset)
   */
  clear(): Promise<void>

  /**
   * Batch create multiple items
   */
  batchCreate?(items: T[]): Promise<T[]>

  /**
   * Batch update multiple items
   */
  batchUpdate?(items: T[]): Promise<T[]>

  /**
   * Batch delete multiple items
   */
  batchDelete?(ids: string[]): Promise<void>
}
