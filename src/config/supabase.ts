import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key-for-development'

if (supabaseUrl.includes('mock') || supabaseAnonKey.includes('mock')) {
  console.warn('⚠️  Používáte mock Supabase konfiguraci. Některé funkce nebudou fungovat.')
} else {
  console.log('✅ Supabase připojen:', supabaseUrl)
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export type SupabaseClient = typeof supabase