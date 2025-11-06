'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  MoreHorizontal,
  Eye,
  Plus,
  Calendar,
  Package,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Trash2
} from 'lucide-react'
import { deleteWorkOrder } from '@/lib/actions/work-orders'
import { getWorkOrders } from '@/lib/actions/work-orders'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Link from 'next/link'
import { StageProgress } from './stage-progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface WorkOrder {
  id: string
  workOrderNumber: string
  salesOrderId: string
  salesOrderItemId: string
  currentStage: 'order_processing' | 'material_procurement' | 'cutting' | 'sewing_assembly' | 'quality_control' | 'finishing' | 'dispatch' | 'delivered'
  startedAt?: string | Date | null
  completedAt?: string | Date | null
  estimatedCompletion?: string | Date | null
  priority: number
  assignedTo?: string | null
  createdBy: string
  createdAt: string | Date
  updatedAt: string | Date
  salesOrderNumber?: string
  customerName?: string
  productName?: string
  quantity?: number
  size?: string | null
  color?: string | null
}


export function WorkOrderList() {
  const { toast } = useToast()

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null)

  // Fetch work orders
  const fetchWorkOrders = async () => {
    setLoading(true)
    try {
      const result = await getWorkOrders()
      if (result.success && result.data) {
        setWorkOrders(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch work orders',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch work orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterWorkOrders()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, stageFilter])

  const filterWorkOrders = () => {
    // This is already handled by the useEffect with search and stage filter
    // The filtering logic would be implemented in the API call in a real app
  }

  const handleDelete = async (workOrder: WorkOrder) => {
    setWorkOrderToDelete(workOrder)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!workOrderToDelete) return

    try {
      const result = await deleteWorkOrder(workOrderToDelete.id)
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        // Refresh the work orders list
        await fetchWorkOrders()
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
        description: 'Failed to delete work order',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setWorkOrderToDelete(null)
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
      return <Badge variant="destructive">High</Badge>
    } else if (priority <= 7) {
      return <Badge variant="default">Medium</Badge>
    } else {
      return <Badge variant="secondary">Low</Badge>
    }
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = searchQuery === '' ||
      workOrder.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.salesOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workOrder.productName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStage = stageFilter === 'all' || workOrder.currentStage === stageFilter

    return matchesSearch && matchesStage
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Work Orders...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Orders ({filteredWorkOrders.length})</CardTitle>
              <CardDescription>
                Track work orders through the 8-stage production workflow.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/work-orders/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Stage: {stageFilter === 'all' ? 'All Stages' : stageFilter.replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStageFilter('all')}>
                  All Stages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('order_processing')}>
                  Order Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('material_procurement')}>
                  Material Procurement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('cutting')}>
                  Cutting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('sewing_assembly')}>
                  Sewing & Assembly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('quality_control')}>
                  Quality Control
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('finishing')}>
                  Finishing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('dispatch')}>
                  Dispatch
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStageFilter('delivered')}>
                  Delivered
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Work Orders Table */}
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchQuery || stageFilter !== 'all' ? 'No matching work orders found' : 'No work orders yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || stageFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first work order from an approved sales order to get started'
                }
              </p>
              {!(searchQuery || stageFilter !== 'all') && (
                <Button asChild>
                  <Link href="/work-orders/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Work Order
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order #</TableHead>
                    <TableHead>Sales Order</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Est. Completion</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.map((workOrder) => (
                    <TableRow key={workOrder.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Button variant="link" className="h-auto p-0 font-medium text-left" asChild>
                          <Link href={`/work-orders/${workOrder.id}`}>
                            {workOrder.workOrderNumber}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" className="h-auto p-0 text-left" asChild>
                          <Link href={`/sales-orders/${workOrder.salesOrderId}`}>
                            {workOrder.salesOrderNumber}
                          </Link>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-lg">{workOrder.quantity} Items</div>
                          <div className="text-sm text-muted-foreground">
                            {workOrder.productName} {workOrder.size && `| ${workOrder.size}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{workOrder.customerName}</div>
                      </TableCell>
                      <TableCell>
                        {getStageBadge(workOrder.currentStage)}
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(workOrder.priority)}
                      </TableCell>
                      <TableCell>
                        <StageProgress currentStage={workOrder.currentStage} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {workOrder.estimatedCompletion ? formatDate(workOrder.estimatedCompletion) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/work-orders/${workOrder.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(workOrder)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && workOrderToDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete work order "{workOrderToDelete.workOrderNumber}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}