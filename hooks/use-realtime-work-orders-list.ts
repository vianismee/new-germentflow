'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRealtimeWorkOrders } from './use-realtime-work-orders'
import { getWorkOrders } from '@/lib/actions/work-orders'
import { WorkOrder } from '@/lib/actions/work-orders'

interface UseRealtimeWorkOrdersListProps {
  initialData?: WorkOrder[] | null
  enabled?: boolean
}

export function useRealtimeWorkOrdersList({
  initialData = null,
  enabled = true
}: UseRealtimeWorkOrdersListProps = {}) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialData || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch work orders data
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await getWorkOrders()
      if (result.success && result.data) {
        setWorkOrders(result.data)
      } else {
        setError(result.error || 'Failed to fetch work orders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Setup realtime subscriptions
  const { isConnected } = useRealtimeWorkOrders({
    enabled,
    onWorkOrderChange: useCallback((payload) => {
      console.log('Work orders list updated, refreshing data...')
      fetchWorkOrders()
    }, [fetchWorkOrders]),
    onStageHistoryChange: useCallback((payload) => {
      console.log('Stage history updated, refreshing work orders list...')
      fetchWorkOrders()
    }, [fetchWorkOrders])
  })

  // Initial data fetch
  useEffect(() => {
    if (enabled && !initialData) {
      fetchWorkOrders()
    }
  }, [enabled, initialData, fetchWorkOrders])

  // Function to manually refresh data
  const refresh = useCallback(() => {
    fetchWorkOrders()
  }, [fetchWorkOrders])

  return {
    workOrders,
    loading,
    error,
    isConnected,
    refresh
  }
}