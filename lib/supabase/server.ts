import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return mock client if credentials are missing
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null } }),
        getSession: () => Promise.resolve({ data: { session: null } })
      },
      from: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null }) }),
        insert: () => Promise.resolve({ error: null }),
        eq: () => ({ single: () => Promise.resolve({ data: null }) })
      })
    } as any
  }

  const cookieStore = cookies()

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}