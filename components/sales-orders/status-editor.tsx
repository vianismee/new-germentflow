"use client"

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { updateOrderStatus } from '@/lib/actions/sales-orders'
import { CheckCircle, AlertCircle, Clock, FileText, Loader2 } from 'lucide-react'

type OrderStatus = 'draft' | 'on_review' | 'approve' | 'cancelled'

interface StatusEditorProps {
  orderId: string
  currentStatus: OrderStatus | string
  onStatusChange?: (newStatus: string) => void
}

const statusConfig = {
  draft: {
    label: 'Draft',
    description: 'Order is being prepared',
    icon: FileText,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  on_review: {
    label: 'On Review',
    description: 'Order is under review',
    icon: Clock,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  approve: {
    label: 'Approved',
    description: 'Order has been approved',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order has been cancelled',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  }
}

export function StatusEditor({ orderId, currentStatus, onStatusChange }: StatusEditorProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    // Ensure the selected status is valid
    if (!(newStatus in statusConfig)) {
      toast({
        title: 'Error',
        description: 'Invalid status selected',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await updateOrderStatus(orderId, newStatus)

      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Order status changed to ${statusConfig[newStatus].label}`,
        })
        onStatusChange?.(newStatus)
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const currentConfig = statusConfig[currentStatus as OrderStatus] || statusConfig.draft
  const CurrentIcon = currentConfig.icon

  return (
    <Select
      value={currentStatus in statusConfig ? currentStatus : 'draft'}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger className={`w-[140px] ${currentConfig.className} border-2`}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Updating...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <CurrentIcon className="h-3 w-3" />
            <SelectValue />
          </div>
        )}
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([value, config]) => (
          <SelectItem key={value} value={value}>
            {config.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}