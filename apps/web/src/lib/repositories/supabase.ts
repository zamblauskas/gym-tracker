import { IDataRepository } from './types'
import { supabase } from '../supabase'

/**
 * Type mapping for entity types to Supabase table names
 */
type TableName = 'exercise_types' | 'exercises' | 'routines' | 'programs' | 'workout_sessions'

/**
 * Supabase implementation of the data repository
 * Handles serialization/deserialization including Date objects and JSONB fields
 * Implements Row Level Security (RLS) with automatic user_id injection
 */
export class SupabaseRepository<T extends { id: string }> implements IDataRepository<T> {
  private readonly tableName: TableName
  private readonly caseConversionCache: Map<string, string> = new Map()

  constructor(tableName: TableName) {
    this.tableName = tableName
  }

  /**
   * Get the current authenticated user's ID
   * Throws error if user is not authenticated
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('User must be authenticated to access data')
    }

    return user.id
  }

  async getAll(): Promise<T[]> {
    try {
      // RLS will automatically filter by user_id via auth.uid()
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`Error fetching from ${this.tableName}:`, error)
        throw error
      }

      return (data || []).map(item => this.deserializeDates(item))
    } catch (error) {
      console.error(`Error reading from Supabase (${this.tableName}):`, error)
      // Return empty array for unauthenticated users
      return []
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      // RLS will automatically filter by user_id via auth.uid()
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found or not authorized
          return null
        }
        console.error(`Error fetching from ${this.tableName}:`, error)
        throw error
      }

      return data ? this.deserializeDates(data) : null
    } catch (error) {
      console.error(`Error reading from Supabase (${this.tableName}):`, error)
      return null
    }
  }

  async create(item: T): Promise<T> {
    try {
      // Get current user ID for RLS
      const userId = await this.getCurrentUserId()

      const serializedItem = this.serializeForSupabase(item)

      // Inject user_id into the item
      const itemWithUser = {
        ...serializedItem,
        user_id: userId
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([itemWithUser])
        .select()
        .single()

      if (error) {
        console.error(`Error creating in ${this.tableName}:`, error)
        throw error
      }

      return this.deserializeDates(data)
    } catch (error) {
      console.error(`Error writing to Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  async update(id: string, item: T): Promise<T> {
    try {
      // Ensure user is authenticated
      await this.getCurrentUserId()

      const serializedItem = this.serializeForSupabase(item)

      // RLS will automatically ensure user can only update their own data
      const { data, error } = await supabase
        .from(this.tableName)
        .update(serializedItem)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating in ${this.tableName}:`, error)
        throw error
      }

      return this.deserializeDates(data)
    } catch (error) {
      console.error(`Error updating in Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Ensure user is authenticated
      await this.getCurrentUserId()

      // RLS will automatically ensure user can only delete their own data
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`Error deleting from ${this.tableName}:`, error)
        throw error
      }
    } catch (error) {
      console.error(`Error deleting from Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  async clear(): Promise<void> {
    try {
      // Ensure user is authenticated
      const userId = await this.getCurrentUserId()

      // RLS will automatically ensure user can only delete their own data
      // This will only clear the current user's data, not all data
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error(`Error clearing ${this.tableName}:`, error)
        throw error
      }
    } catch (error) {
      console.error(`Error clearing Supabase table (${this.tableName}):`, error)
      throw error
    }
  }

  async batchCreate(items: T[]): Promise<T[]> {
    try {
      const userId = await this.getCurrentUserId()

      const serializedItems = items.map(item => ({
        ...this.serializeForSupabase(item),
        user_id: userId
      }))

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(serializedItems)
        .select()

      if (error) {
        console.error(`Error batch creating in ${this.tableName}:`, error)
        throw error
      }

      return (data || []).map(item => this.deserializeDates(item))
    } catch (error) {
      console.error(`Error batch writing to Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  async batchUpdate(items: T[]): Promise<T[]> {
    try {
      await this.getCurrentUserId()

      // Supabase doesn't have native batch update, use upsert
      const serializedItems = items.map(item => this.serializeForSupabase(item))

      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(serializedItems)
        .select()

      if (error) {
        console.error(`Error batch updating in ${this.tableName}:`, error)
        throw error
      }

      return (data || []).map(item => this.deserializeDates(item))
    } catch (error) {
      console.error(`Error batch updating in Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    try {
      await this.getCurrentUserId()

      // Supabase doesn't have native batch delete, delete in parallel
      const deletePromises = ids.map(id =>
        supabase.from(this.tableName).delete().eq('id', id)
      )

      const results = await Promise.all(deletePromises)

      const errors = results.filter(r => r.error).map(r => r.error)
      if (errors.length > 0) {
        console.error(`Error batch deleting from ${this.tableName}:`, errors)
        throw new Error(`Failed to delete ${errors.length} items`)
      }
    } catch (error) {
      console.error(`Error batch deleting from Supabase (${this.tableName}):`, error)
      throw error
    }
  }

  /**
   * Serialize data for Supabase storage
   * Converts field names from camelCase to snake_case for database columns
   */
  private serializeForSupabase(obj: any): any {
    if (obj === null || obj === undefined) return obj

    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString()
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeForSupabase(item))
    }

    // Handle objects
    if (typeof obj === 'object') {
      const result: any = {}
      for (const key in obj) {
        // Convert camelCase to snake_case for database columns
        const snakeKey = this.camelToSnake(key)
        result[snakeKey] = this.serializeForSupabase(obj[key])
      }
      return result
    }

    return obj
  }

  /**
   * Recursively deserialize Date objects from Supabase response
   * Converts ISO date strings back to Date objects
   * Also converts snake_case field names back to camelCase
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
        // Convert snake_case to camelCase for TypeScript objects
        const camelKey = this.snakeToCamel(key)
        result[camelKey] = this.deserializeDates(obj[key])
      }
      return result
    }

    return obj
  }

  /**
   * Convert camelCase to snake_case (memoized)
   */
  private camelToSnake(str: string): string {
    const cached = this.caseConversionCache.get(`c2s:${str}`)
    if (cached) return cached

    const result = str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    this.caseConversionCache.set(`c2s:${str}`, result)
    return result
  }

  /**
   * Convert snake_case to camelCase (memoized)
   */
  private snakeToCamel(str: string): string {
    const cached = this.caseConversionCache.get(`s2c:${str}`)
    if (cached) return cached

    const result = str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    this.caseConversionCache.set(`s2c:${str}`, result)
    return result
  }
}
