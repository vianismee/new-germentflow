'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase, RealtimePayload } from '@/lib/supabase'
import { WorkOrder } from '@/lib/actions/work-orders'

interface UseRealtimeWorkOrdersProps {
  onWorkOrderChange?: (payload: RealtimePayload<any>) => void
  onStageHistoryChange?: (payload: RealtimePayload<any>) => void
  enabled?: boolean
}

export function useRealtimeWorkOrders({
  onWorkOrderChange,
  onStageHistoryChange,
  enabled = true
}: UseRealtimeWorkOrdersProps = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const workOrderChannelRef = useRef<any>(null)
  const stageHistoryChannelRef = useRef<any>(null)

  useEffect(() => {
    if (!enabled) return

    // Setup work orders realtime subscription
    const workOrderChannel = supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders'
        },
        (payload) => {
          console.log('Work order change:', payload)
          onWorkOrderChange?.(payload)
        }
      )
      .subscribe((status) => {
        console.log('Work orders subscription status:', status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    workOrderChannelRef.current = workOrderChannel

    // Setup production stage history realtime subscription
    const stageHistoryChannel = supabase
      .channel('production_stage_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_stage_history'
        },
        (payload) => {
          console.log('Stage history change:', payload)
          onStageHistoryChange?.(payload)
        }
      )
      .subscribe((status) => {
        console.log('Stage history subscription status:', status)
      })

    stageHistoryChannelRef.current = stageHistoryChannel

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscriptions')
      if (workOrderChannelRef.current) {
        supabase.removeChannel(workOrderChannelRef.current)
      }
      if (stageHistoryChannelRef.current) {
        supabase.removeChannel(stageHistoryChannelRef.current)
      }
      setIsConnected(false)
    }
  }, [enabled, onWorkOrderChange, onStageHistoryChange])

  return {
    isConnected,
    disconnect: () => {
      if (workOrderChannelRef.current) {
        supabase.removeChannel(workOrderChannelRef.current)
      }
      if (stageHistoryChannelRef.current) {
        supabase.removeChannel(stageHistoryChannelRef.current)
      }
      setIsConnected(false)
    }
  }
}