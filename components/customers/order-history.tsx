'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings,
  Shirt,
  Zap,
  Shield,
  Archive
} from 'lucide-react'
import { getCustomerOrdersWithItems } from '@/lib/actions/customers'
import { useToast } from '@/hooks/use-toast'
import { OrderDetailModal } from './order-detail-modal'
import { format } from 'date-fns'

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

interface OrderHistoryProps {
  customerId: string
  customerName: string
}

export function OrderHistory({ customerId, customerName }: OrderHistoryProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: 'Draft',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FileText
      },
      processing: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock
      },
      completed: {
        label: 'Completed',
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

  
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy')
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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

          {/* Orders List */}
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
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <Collapsible
                      open={expandedOrders.has(order.id)}
                      onOpenChange={() => toggleOrderExpansion(order.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <div className="p-3 lg:p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {getStatusBadge(order.status)}
                                {isOrderOverdue(order) && (
                                  <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                                    <AlertCircle className="h-3 w-3" />
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-base lg:text-lg">{order.orderNumber}</p>
                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(order.orderDate)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Due: {formatDate(order.targetDeliveryDate)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {order.items?.length || 0} items
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between lg:space-x-4">
                              <div className="text-right">
                                <p className="text-sm lg:text-base text-muted-foreground">
                                  {order.items?.length || 0} items
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" className="ml-2">
                                {expandedOrders.has(order.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <Separator />
                        <div className="p-4 space-y-4">
                          {/* Order Notes */}
                          {order.notes && (
                            <div>
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Order Notes
                              </h4>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                {order.notes}
                              </p>
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Order Items ({order.items?.length || 0})
                            </h4>
                            <div className="space-y-2">
                              {order.items?.map((item) => (
                                <div key={item.id} className="p-3 bg-muted/30 rounded">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm lg:text-base truncate">{item.productName}</p>
                                      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-muted-foreground mt-1">
                                        <span>Qty: {item.quantity}</span>
                                        {item.size && <span>Size: {item.size}</span>}
                                        {item.color && (
                                          <span className="flex items-center gap-1">
                                            Color:
                                            <div
                                              className="w-3 h-3 rounded border border-gray-300"
                                              style={{ backgroundColor: item.color.toLowerCase() }}
                                            />
                                            {item.color}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Timeline */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Order Timeline
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3 text-sm">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="font-medium">Order Created</span>
                                <span className="text-muted-foreground">
                                  {formatDate(order.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-sm">
                                <div className={`w-3 h-3 rounded-full ${
                                  order.status === 'approve' ? 'bg-green-500' :
                                  order.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-yellow-500'
                                }`}></div>
                                <span className="font-medium">Current Status</span>
                                <span className="text-muted-foreground">
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              {order.actualDeliveryDate && (
                                <div className="flex items-center space-x-3 text-sm">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="font-medium">Delivered</span>
                                  <span className="text-muted-foreground">
                                    {formatDate(order.actualDeliveryDate)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrderId(order.id)
                                setDetailModalOpen(true)
                              }}
                              className="w-full sm:w-auto"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                              <Archive className="h-4 w-4 mr-2" />
                              Download Invoice
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          customerId={customerId}
          orderId={selectedOrderId}
        />
      )}
    </div>
  )
}