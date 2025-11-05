'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRealtimeWorkOrder } from '@/hooks/use-realtime-work-order'
import {
  ArrowLeft,
  Package,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Settings
} from 'lucide-react'
import { updateWorkOrderStage } from '@/lib/actions/work-orders'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Link from 'next/link'
import { StageWorkflow } from './stage-workflow'
import { ProductionLog } from './production-log'

interface ProductionStage {
  id: string
  workOrderId: string
  stage: string
  startedAt: Date
  completedAt?: Date | null
  duration?: number | null
  notes?: string | null
  userId: string
  createdAt: Date
}

interface WorkOrder {
  id: string
  workOrderNumber: string
  salesOrderId: string
  salesOrderItemId: string
  currentStage: 'order_processing' | 'material_procurement' | 'cutting' | 'sewing_assembly' | 'quality_control' | 'finishing' | 'dispatch' | 'delivered'
  startedAt?: Date | null
  completedAt?: Date | null
  estimatedCompletion?: Date | null
  priority: number
  assignedTo?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  salesOrderNumber?: string
  customerName?: string
  productName?: string
  quantity?: number
  size?: string | null
  color?: string | null
  stageHistory?: ProductionStage[]
}

interface WorkOrderDetailProps {
  workOrder: WorkOrder
}

export function WorkOrderDetail({ workOrder: initialWorkOrder }: WorkOrderDetailProps) {
  const { toast } = useToast()

  // Use realtime hook for work order data
  const { workOrder } = useRealtimeWorkOrder({
    workOrderId: initialWorkOrder.id,
    initialData: initialWorkOrder
  })

  const [stageNotes, setStageNotes] = useState('')
  const [loading, setLoading] = useState(false)

  
  const handleStageUpdate = async (newStage: string) => {
    if (!workOrder) return

    setLoading(true)
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing
      const result = await updateWorkOrderStage(workOrder.id, newStage, userId, stageNotes)
      if (result.success) {
        toast({
          title: 'Stage Updated',
          description: result.message,
        })
        setStageNotes('')
        // Real-time updates will refresh the data automatically
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getStageBadge = (stage: string) => {
    const stageConfig = {
      order_processing: {
        label: 'Order Processing',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FileText
      },
      material_procurement: {
        label: 'Material Procurement',
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Package
      },
      cutting: {
        label: 'Cutting',
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Settings
      },
      sewing_assembly: {
        label: 'Sewing & Assembly',
        className: 'bg-pink-100 text-pink-800 border-pink-200',
        icon: Settings
      },
      quality_control: {
        label: 'Quality Control',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle
      },
      finishing: {
        label: 'Finishing',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Settings
      },
      dispatch: {
        label: 'Dispatch',
        className: 'bg-teal-100 text-teal-800 border-teal-200',
        icon: Package
      },
      delivered: {
        label: 'Delivered',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      }
    }

    const config = stageConfig[stage as keyof typeof stageConfig] || stageConfig.order_processing
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: number) => {
    if (priority <= 3) {
      return <Badge variant="destructive">High Priority</Badge>
    } else if (priority <= 7) {
      return <Badge variant="default">Medium Priority</Badge>
    } else {
      return <Badge variant="secondary">Low Priority</Badge>
    }
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const formatDateTime = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy \'at\' h:mm a')
  }

  const isOverdue = () => {
    if (!workOrder || workOrder.currentStage === 'delivered') return false
    if (workOrder.estimatedCompletion) {
      return new Date(workOrder.estimatedCompletion) < new Date()
    }
    return false
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Work order not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Work Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {workOrder.workOrderNumber}
              {getStageBadge(workOrder.currentStage)}
              {getPriorityBadge(workOrder.priority)}
              {isOverdue() && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Overdue
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Created on {formatDateTime(workOrder.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Delete functionality removed - work orders should not be deleted after creation */}
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Work Order Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Work Order Details</CardTitle>
              <CardDescription>
                Basic information about this work order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Work Order #:</span> {workOrder.workOrderNumber}
                    </div>
                    <div>
                      <span className="font-medium">Sales Order #:</span>{' '}
                      <Button variant="link" className="h-auto p-0 text-left" asChild>
                        <Link href={`/sales-orders/${workOrder.salesOrderId}`}>
                          {workOrder.salesOrderNumber}
                        </Link>
                      </Button>
                    </div>
                    <div>
                      <span className="font-medium">Started:</span>{' '}
                      {workOrder.startedAt ? formatDate(workOrder.startedAt) : 'Not started'}
                    </div>
                    <div>
                      <span className="font-medium">Est. Completion:</span>{' '}
                      {workOrder.estimatedCompletion ? formatDate(workOrder.estimatedCompletion) : '-'}
                    </div>
                    {workOrder.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span> {formatDate(workOrder.completedAt)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Priority:</span> {getPriorityBadge(workOrder.priority)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Total Items:</span>
                      <span className="text-lg font-bold text-primary ml-2">{workOrder.quantity}</span>
                    </div>
                    <div>
                      <span className="font-medium">Product:</span> {workOrder.productName}
                    </div>
                    {workOrder.size && (
                      <div>
                        <span className="font-medium">Size:</span> {workOrder.size}
                      </div>
                    )}
                    {workOrder.color && (
                      <div>
                        <span className="font-medium">Color:</span> {workOrder.color}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Customer:</span> {workOrder.customerName}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Workflow */}
          <Card>
            <CardHeader>
              <CardTitle>Production Workflow</CardTitle>
              <CardDescription>
                Track progress through the 8-stage production process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StageWorkflow
                workOrderId={workOrder.id}
                currentStage={workOrder.currentStage}
                stageHistory={(workOrder as any).stageHistory || []}
                onStageUpdate={handleStageUpdate}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Stage Notes */}
          {workOrder.currentStage !== 'delivered' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Stage Notes
                </CardTitle>
                <CardDescription>
                  Add notes when transitioning to the next stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stage-notes">Notes for next stage transition</Label>
                    <Textarea
                      id="stage-notes"
                      placeholder="Add any notes, issues, or observations for this stage transition..."
                      value={stageNotes}
                      onChange={(e) => setStageNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/sales-orders/${workOrder.salesOrderId}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View Sales Order
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Production Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Production Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ProductionLog stageHistory={(workOrder as any).stageHistory || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}