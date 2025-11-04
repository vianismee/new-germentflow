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
  User,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Trash2
} from 'lucide-react'
import { getWorkOrders, deleteWorkOrder, getApprovedSalesOrdersForWorkOrders, createWorkOrderFromSalesOrderItem } from '@/lib/actions/work-orders'
import { useToast } from '@/hooks/use-toast'
import { useRealtimeWorkOrdersList } from '@/hooks/use-realtime-work-orders-list'
import { format } from 'date-fns'
import Link from 'next/link'
import { StageProgress } from './stage-progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface SalesOrderItem {
  id: string
  productName: string
  quantity: number
  size?: string | null
  color?: string | null
}

interface SalesOrder {
  id: string
  orderNumber: string
  customerName?: string
  orderDate: string | Date
  targetDeliveryDate: string | Date
  items?: SalesOrderItem[]
}

export function WorkOrderList() {
  const { toast } = useToast()

  // Use realtime hook for work orders
  const { workOrders, loading, error, isConnected, refresh } = useRealtimeWorkOrdersList()

  const [approvedSalesOrders, setApprovedSalesOrders] = useState<SalesOrder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchApprovedSalesOrders()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterWorkOrders()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, stageFilter])

  const fetchApprovedSalesOrders = async () => {
    try {
      const approvedSalesResult = await getApprovedSalesOrdersForWorkOrders()

      if (approvedSalesResult.success && approvedSalesResult.data) {
        console.log('Approved sales orders data:', approvedSalesResult.data)
        // The data is already correctly grouped from the backend
        setApprovedSalesOrders(approvedSalesResult.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch approved sales orders',
        variant: 'destructive',
      })
    }
  }

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
        // Real-time updates will handle the refresh automatically
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
        description: 'Failed to delete work order',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setWorkOrderToDelete(null)
    }
  }

  const handleCreateWorkOrder = async (salesOrderItemId: string) => {
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing
      const result = await createWorkOrderFromSalesOrderItem(salesOrderItemId, userId)
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        setCreateDialogOpen(false)
        fetchApprovedSalesOrders() // Refresh approved sales orders
        // Real-time updates will handle the work order list refresh automatically
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
        description: 'Failed to create work order',
        variant: 'destructive',
      })
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
              <div className="flex items-center gap-2">
                <CardTitle>Work Orders ({filteredWorkOrders.length})</CardTitle>
                {isConnected && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </div>
                )}
              </div>
              <CardDescription>
                Manage production work orders and track their progress through the 8-stage workflow.
                {isConnected && " Real-time updates enabled."}
              </CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Work Order
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Work Order from Approved Sales Order</DialogTitle>
                  <DialogDescription>
                    Select a sales order item to convert into a work order. Only approved sales orders are shown.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {approvedSalesOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No approved sales orders available
                      </h3>
                      <p className="text-muted-foreground">
                        Approve some sales orders first to create work orders.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvedSalesOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{order.orderNumber}</h4>
                              <p className="text-sm text-muted-foreground">Customer: {order.customerName}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Target: {formatDate(order.targetDeliveryDate)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Qty: {item.quantity} {item.size && `| Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleCreateWorkOrder(item.id)}
                                >
                                  Create WO
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
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
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Work Order
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