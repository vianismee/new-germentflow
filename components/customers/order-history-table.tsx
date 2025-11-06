'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Filter,
  Eye,
  Settings,
  Shirt,
  Truck,
  Wrench
} from 'lucide-react'
import { getCustomerOrdersWithItems } from '@/lib/actions/customers'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Link from 'next/link'

interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  orderDate: string | Date
  targetDeliveryDate: string | Date
  actualDeliveryDate?: string | Date | null
  status: 'draft' | 'on_review' | 'approve' | 'cancelled'
  totalAmount: string
  notes?: string | null
  createdBy: string
  createdAt: string | Date
  updatedAt: string | Date
  items?: SalesOrderItem[]
  workOrders?: WorkOrder[]
}

interface SalesOrderItem {
  id: string
  salesOrderId: string
  productName: string
  quantity: number
  size?: string | null
  color?: string | null
  designFileUrl?: string | null
  unitPrice: string
  totalPrice: string
  specifications?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

interface WorkOrder {
  id: string
  workOrderNumber: string
  salesOrderId: string
  salesOrderItemId: string
  currentStage: string
  startedAt?: string | Date | null
  completedAt?: string | Date | null
  estimatedCompletion?: string | Date | null
  priority: number
  assignedTo?: string | null
  createdBy: string
  createdAt: string | Date
  updatedAt: string | Date
}

interface OrderHistoryTableProps {
  customerId: string
  customerName: string
}

export function OrderHistoryTable({ customerId, customerName }: OrderHistoryTableProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [customerId])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const fetchOrders = async () => {
    try {
      const result = await getCustomerOrdersWithItems(customerId, 50)

      if (result.success && result.data) {
        setOrders(result.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch customer orders',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some(item =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.color?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: 'Draft',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FileText
      },
      on_review: {
        label: 'Review',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock
      },
      approve: {
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getProductionStageIcon = (stage: string) => {
    switch (stage) {
      case 'order_processing':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'material_procurement':
        return <Package className="h-4 w-4 text-purple-600" />
      case 'cutting':
        return <Settings className="h-4 w-4 text-orange-600" />
      case 'sewing_assembly':
        return <Shirt className="h-4 w-4 text-indigo-600" />
      case 'quality_control':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'finishing':
        return <Wrench className="h-4 w-4 text-yellow-600" />
      case 'dispatch':
        return <Truck className="h-4 w-4 text-gray-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-700" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const getWorkOrdersForSalesOrder = (order: SalesOrder) => {
    return order.workOrders || []
  }

  const getItemsForSalesOrder = (order: SalesOrder) => {
    return order.items || []
  }

  const getLatestWorkOrderStage = (workOrders: WorkOrder[]) => {
    if (workOrders.length === 0) return null
    // Sort by createdAt to get the most recent work order
    const sortedWorkOrders = workOrders.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return sortedWorkOrders[0]?.currentStage
  }

  const isOrderOverdue = (order: SalesOrder) => {
    if (order.status === 'approve' || order.status === 'cancelled') return false
    return new Date(order.targetDeliveryDate) < new Date()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Loading Order History...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History
          </CardTitle>
          <CardDescription>
            Complete order history for {customerName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="on_review">On Review</SelectItem>
                <SelectItem value="approve">Approved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            <div className="flex items-center space-x-2 p-2 lg:p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-blue-600">Total</p>
                <p className="text-lg lg:text-2xl font-bold text-blue-800 truncate">{orders.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 lg:p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-green-600">Done</p>
                <p className="text-lg lg:text-2xl font-bold text-green-800 truncate">
                  {orders.filter(o => o.status === 'approve').length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 lg:p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs lg:text-sm font-medium text-yellow-600">Active</p>
                <p className="text-lg lg:text-2xl font-bold text-yellow-800 truncate">
                  {orders.filter(o => o.status === 'on_review').length}
                </p>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'This customer hasn\'t placed any orders yet'
                }
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO No.</TableHead>
                    <TableHead>WO No.</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const workOrders = getWorkOrdersForSalesOrder(order)
                    const items = getItemsForSalesOrder(order)
                    const latestStage = getLatestWorkOrderStage(workOrders)

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/customers/${customerId}/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                          {isOrderOverdue(order) && (
                            <Badge variant="destructive" className="flex items-center gap-1 text-xs mt-1">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {workOrders.length > 0 ? (
                              workOrders.map((wo) => (
                                <div key={wo.id} className="text-sm">
                                  {wo.workOrderNumber}
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No WO</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {items.length > 0 ? (
                              items.map((item, index) => (
                                <div key={item.id} className="text-sm">
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-muted-foreground text-xs">
                                    Qty: {item.quantity}
                                    {item.size && ` • Size: ${item.size}`}
                                    {item.color && ` • ${item.color}`}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No items</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {latestStage ? (
                              <>
                                {getProductionStageIcon(latestStage)}
                                <span className="text-sm capitalize">
                                  {latestStage.replace('_', ' ')}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">Not started</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(order.orderDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Due: {formatDate(order.targetDeliveryDate)}</div>
                            {order.actualDeliveryDate && (
                              <div className="text-green-600">
                                Actual: {formatDate(order.actualDeliveryDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/customers/${customerId}/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}