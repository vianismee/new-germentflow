'use client'

import React from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  role?: string
  permissions?: any
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getDefaultPermissions = (role: string) => {
  switch (role) {
    case 'admin':
      return { all: true }
    case 'production-manager':
      return {
        sales_orders: ['read', 'write'],
        work_orders: ['read', 'write'],
        customers: ['read'],
        quality_control: ['read'],
        dashboard: ['read']
      }
    case 'quality-inspector':
      return {
        work_orders: ['read'],
        quality_control: ['read', 'write'],
        customers: ['read'],
        dashboard: ['read']
      }
    case 'viewer':
    default:
      return {
        sales_orders: ['read'],
        work_orders: ['read'],
        customers: ['read'],
        quality_control: ['read'],
        dashboard: ['read']
      }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role, permissions, is_active')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single()

        const role = userRole?.role || 'viewer'
        const permissions = userRole?.permissions ? JSON.parse(userRole.permissions) : {}

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email,
          role,
          permissions
        })
      }
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role, permissions, is_active')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single()

        const role = userRole?.role || 'viewer'
        const permissions = userRole?.permissions ? JSON.parse(userRole.permissions) : {}

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email,
          role,
          permissions
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push('/dashboard')
    }

    return { error }
  }

  const signUp = async (email: string, password: string, name: string, role: string = 'viewer') => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        // Disable email confirmation for auto-confirmation
        emailRedirectTo: undefined
      }
    })

    if (!error && data.user) {
      // Auto-confirm the user by signing them in immediately
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

      await supabase.from('user_roles').insert({
        id: crypto.randomUUID(),
        user_id: data.user.id,
        role,
        permissions: JSON.stringify(getDefaultPermissions(role)),
        is_active: true,
        assigned_by: 'system',
        assigned_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}