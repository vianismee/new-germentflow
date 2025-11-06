'use server'

import { createClient } from '@/lib/supabase/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

export async function signUpAndAutoConfirm(email: string, password: string, name: string, role: string = 'viewer') {
  const supabase = createClient()

  try {
    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    if (signUpError || !signUpData.user) {
      return { success: false, error: signUpError?.message || 'Signup failed' }
    }

    // Step 2: Auto-confirm the user if enabled
    if (AUTH_CONFIG.AUTO_CONFIRM_SIGNUP) {
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        signUpData.user.id,
        {
          email_confirm: true,
          user_metadata: {
            full_name: name,
            auto_confirmed: true
          }
        }
      )

      if (confirmError) {
        console.warn('Auto-confirmation failed:', confirmError)
        // Continue anyway as this might be a permissions issue
      }
    }

    // Step 3: Insert user role
    const { error: roleError } = await supabase.from('user_roles').insert({
      id: crypto.randomUUID(),
      user_id: signUpData.user.id,
      role,
      permissions: JSON.stringify(getDefaultPermissions(role)),
      is_active: true,
      assigned_by: 'system',
      assigned_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (roleError) {
      console.warn('Role assignment failed:', roleError)
      return { success: false, error: 'Failed to assign user role' }
    }

    // Step 4: Sign in the user immediately if auto-confirmation is enabled
    if (AUTH_CONFIG.AUTO_CONFIRM_SIGNUP) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.warn('Auto sign-in failed:', signInError)
        // Don't fail the whole process if auto sign-in doesn't work
      }
    }

    return { success: true, data: signUpData }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

function getDefaultPermissions(role: string) {
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