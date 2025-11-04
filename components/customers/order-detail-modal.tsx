'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Settings,
  Shirt,
  Mail,
  Phone
} from 'lucide-react'
import { getCustomerOrderWithDetails } from '@/lib/actions/customers'
import { useToast } from '@/hooks/use-toast'
import { ProductionStageTracker } from './production-stage-tracker'
import { format } from 'date-fns'

interface SalesOrder {
  id: string
  orderNumber: string
  customerId: string
  orderDate: string | Date
  targetDeliveryDate: string | Date
  actualDeliveryDate?: string | Date | null
  status: 'draft' | 'processing' | 'completed' | 'cancelled'
  totalAmount: string
  notes?: string | null
  createdBy: string
  createdAt: string | Date
  updatedAt: string | Date
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

interface OrderDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  orderId: string
}

interface OrderDetails {
  order: SalesOrder
  items: SalesOrderItem[]
  workOrders: any[]
}

export function OrderDetailModal({ open, onOpenChange, customerId, orderId }: OrderDetailModalProps) {
  const { toast } = useToast()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails()
    }
  }, [open, orderId])

  const fetchOrderDetails = async () => {
    try {
      const result = await getCustomerOrderWithDetails(customerId, orderId)

      if (result.success && result.data) {
        setOrderDetails(result.data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch order details',
          variant: 'destructive',
        })
        onOpenChange(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
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

  
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading order details...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!orderDetails) {
    return null
  }

  const { order, items, workOrders } = orderDetails

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            View comprehensive details and production status
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[70vh]">
          <div className="space-y-6 p-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{order.orderNumber}</CardTitle>
                    <CardDescription>
                      Placed on {formatDate(order.orderDate)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Order Date</p>
                      <p className="text-sm">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Target Delivery</p>
                      <p className="text-sm">{formatDate(order.targetDeliveryDate)}</p>
                    </div>
                  </div>
                  {order.actualDeliveryDate && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Actual Delivery</p>
                        <p className="text-sm">{formatDate(order.actualDeliveryDate)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created By</p>
                      <p className="text-sm">{order.createdBy}</p>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Order Notes
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                        {order.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Items and Production Tracking */}
            <Tabs defaultValue="items" className="space-y-4">
              <TabsList>
                <TabsTrigger value="items">Order Items</TabsTrigger>
                <TabsTrigger value="production">Production Tracking</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items ({items.length})</CardTitle>
                    <CardDescription>
                      Detailed breakdown of items in this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-2">{item.productName}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Quantity:</span>
                                  <span>{item.quantity}</span>
                                </div>
                                {item.size && (
                                  <div className="flex items-center space-x-2">
                                    <Shirt className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Size:</span>
                                    <span>{item.size}</span>
                                  </div>
                                )}
                                {item.color && (
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-4 h-4 rounded border"
                                      style={{ backgroundColor: item.color.toLowerCase() }}
                                    />
                                    <span className="font-medium">Color:</span>
                                    <span>{item.color}</span>
                                  </div>
                                )}
                              </div>

                              {item.specifications && (
                                <div className="mt-3">
                                  <h5 className="font-medium text-sm mb-1">Specifications:</h5>
                                  <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                    {item.specifications}
                                  </p>
                                </div>
                              )}

                              {item.designFileUrl && (
                                <div className="mt-3">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Design
                                  </Button>
                                </div>
                              )}
                            </div>
                        </div>
                      ))}

                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="production" className="space-y-4">
                {workOrders.length > 0 ? (
                  <div className="space-y-6">
                    {workOrders.map((workOrder) => (
                      <ProductionStageTracker
                        key={workOrder.workOrder?.id}
                        stages={workOrder.stageHistory || []}
                        currentStage={workOrder.workOrder?.currentStage || 'order_processing'}
                        workOrderId={workOrder.workOrder?.workOrderNumber || 'N/A'}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        No Production Data
                      </h3>
                      <p className="text-muted-foreground">
                        Production tracking will be available once the order enters the production phase.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="communications" className="space-y-4">
                <Card>
                  <CardContent className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Communication History
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No communication records found for this order.
                    </p>
                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Update
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Update
                  </Button>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}