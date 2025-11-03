'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Info, CheckCircle } from 'lucide-react'

export function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'configured' | 'not-configured'>('checking')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if environment variables are set
        const response = await fetch('/api/supabase-status')
        const data = await response.json()

        if (data.configured) {
          setStatus('configured')
        } else {
          setStatus('not-configured')
          setDetails(data.error || 'Supabase is not configured')
        }
      } catch (error) {
        setStatus('not-configured')
        setDetails('Unable to check Supabase status')
      }
    }

    checkStatus()
  }, [])

  if (status === 'checking') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Checking Supabase configuration...
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'not-configured') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p><strong>Supabase not configured</strong></p>
            <p className="text-sm">{details}</p>
            <p className="text-sm">
              Please see <code>SUPABASE_SETUP.md</code> for configuration instructions.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        Supabase is properly configured and ready to use.
      </AlertDescription>
    </Alert>
  )
}