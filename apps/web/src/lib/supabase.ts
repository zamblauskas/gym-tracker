import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  logger.warn('Supabase credentials not found in environment variables. Please configure .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
