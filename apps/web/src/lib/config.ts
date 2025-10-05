/**
 * Application configuration
 * Centralizes environment variable access and app settings
 */

export type StorageBackend = 'localStorage' | 'supabase'

/**
 * Get the configured storage backend
 * Defaults to 'localStorage' if not specified or invalid
 */
export function getStorageBackend(): StorageBackend {
  const backend = import.meta.env.VITE_STORAGE_BACKEND

  if (backend === 'supabase' || backend === 'localStorage') {
    return backend
  }

  // Default to localStorage
  return 'localStorage'
}

/**
 * Check if Supabase credentials are configured
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  return Boolean(url && key)
}

/**
 * Get the current storage backend with validation
 * If Supabase is selected but not configured, falls back to localStorage
 */
export function getActiveStorageBackend(): StorageBackend {
  const backend = getStorageBackend()

  if (backend === 'supabase' && !isSupabaseConfigured()) {
    console.warn(
      'Supabase storage backend selected but credentials not configured. ' +
      'Falling back to localStorage. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
    )
    return 'localStorage'
  }

  return backend
}
