'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRealtimeWorkOrders } from './use-realtime-work-orders'
import { getWorkOrderById } from '@/lib/actions/work-orders'
import { WorkOrder, ProductionStage } from '@/lib/actions/work-orders'

interface UseRealtimeWorkOrderProps {
  workOrderId: string
  initialData?: WorkOrder | null
  enabled?: boolean
}

export function useRealtimeWorkOrder({
  workOrderId,
  initialData = null,
  enabled = true
}: UseRealtimeWorkOrderProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch work order data
  const fetchWorkOrder = useCallback(async () => {
    if (!workOrderId) return

    setLoading(true)
    setError(null)

    try {
      const result = await getWorkOrderById(workOrderId)
      if (result.success && result.data) {
        setWorkOrder(result.data)
      } else {
        setError(result.error || 'Failed to fetch work order')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [workOrderId])

  // Setup realtime subscriptions
  const { isConnected } = useRealtimeWorkOrders({
    enabled: enabled && !!workOrderId,
    onWorkOrderChange: useCallback((payload: any) => {
      // Check if this change affects our work order
      if (payload.new?.id === workOrderId || payload.old?.id === workOrderId) {
        console.log('Work order updated, refreshing data...')
        fetchWorkOrder()
      }
    }, [workOrderId, fetchWorkOrder]),
    onStageHistoryChange: useCallback((payload: any) => {
      // Check if this stage history change affects our work order
      if (payload.new?.work_order_id === workOrderId || payload.old?.work_order_id === workOrderId) {
        console.log('Stage history updated, refreshing work order...')
        fetchWorkOrder()
      }
    }, [workOrderId, fetchWorkOrder])
  })

  // Initial data fetch
  useEffect(() => {
    if (enabled && workOrderId && !initialData) {
      fetchWorkOrder()
    }
  }, [enabled, workOrderId, initialData, fetchWorkOrder])

  // Function to manually refresh data
  const refresh = useCallback(() => {
    fetchWorkOrder()
  }, [fetchWorkOrder])

  return {
    workOrder,
    loading,
    error,
    isConnected,
    refresh
  }
}