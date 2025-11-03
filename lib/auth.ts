import { createClient } from '@/lib/supabase/server'
import { type User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  role?: string
  permissions?: any
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user role from our user_roles table
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, permissions, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  const role = userRole?.role || 'viewer'
  const permissions = userRole?.permissions ? JSON.parse(userRole.permissions) : {}

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.email,
    role,
    permissions
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(requiredRole: string): Promise<AuthUser> {
  const user = await requireAuth()
  if (user.role !== requiredRole && user.role !== 'admin') {
    throw new Error(`Role ${requiredRole} required`)
  }
  return user
}