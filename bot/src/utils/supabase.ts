import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from '../config'

let _botSupabase: SupabaseClient | null = null

export function createBotSupabase(): SupabaseClient {
  if (_botSupabase) return _botSupabase

  _botSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: { persistSession: false },
    db: { schema: 'store' },
  })

  return _botSupabase
}

export function getBotSupabase(): SupabaseClient {
  return _botSupabase ?? createBotSupabase()
}
