'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Shirt,
  Settings,
  Truck,
  User
} from 'lucide-react'
import { getCustomerOrderWithDetails } from '@/lib/actions/customers'
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

interface OrderDetails {
  order: SalesOrder
  items: SalesOrderItem[]
  workOrders: any[]
}

const PRODUCTION_STAGES = [
  { key: 'order_processing', label: 'Order Processing', description: 'Processing order details' },
  { key: 'material_procurement', label: 'Material Procurement', description: 'Sourcing materials' },
  { key: 'cutting', label: 'Cutting', description: 'Cutting fabric patterns' },
  { key: 'sewing_assembly', label: 'Sewing & Assembly', description: 'Assembling garments' },
  { key: 'quality_control', label: 'Quality Control', description: 'Inspecting quality' },
  { key: 'finishing', label: 'Finishing', description: 'Final touches' },
  { key: 'dispatch', label: 'Dispatch', description: 'Preparing shipment' },
  { key: 'delivered', label: 'Delivered', description: 'Order delivered' }
]

export default function CustomerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const customerId = params.id as string
  const salesOrderId = params.salesOrderId as string

  useEffect(() => {
    fetchOrderDetails()
  }, [customerId, salesOrderId])

  const fetchOrderDetails = async () => {
    try {
      const result = await getCustomerOrderWithDetails(customerId, salesOrderId)

      if (result.success && result.data) {
        setOrderDetails(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch order details',
          variant: 'destructive',
        })
        router.push(`/customers/${customerId}`)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      })
      router.push(`/customers/${customerId}`)
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

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy')
  }

  const getProductionProgress = () => {
    if (!orderDetails?.workOrders || orderDetails.workOrders.length === 0) {
      return {
        completed: 0,
        total: PRODUCTION_STAGES.length,
        percentage: 0,
        currentStage: 'order_processing',
        stages: PRODUCTION_STAGES.map(stage => ({ ...stage, status: 'pending' }))
      }
    }

    // Get the most recent work order
    const workOrder = orderDetails.workOrders[0]
    const currentStage = workOrder.workOrder?.currentStage || 'order_processing'
    const stageHistory = workOrder.stageHistory || []

    // Calculate progress based on completed stages
    const completedStages = stageHistory.filter((stage: any) => stage.completedAt).length
    const totalStages = PRODUCTION_STAGES.length
    const percentage = (completedStages / totalStages) * 100

    // Determine status for each stage
    const stages = PRODUCTION_STAGES.map((stage, index) => {
      const stageData = stageHistory.find((h: any) => h.stage === stage.key)
      const isCompleted = stageData?.completedAt
      const isCurrent = stage.key === currentStage
      const isUpcoming = index > PRODUCTION_STAGES.findIndex(s => s.key === currentStage)

      let status = 'pending'
      if (isCompleted) status = 'completed'
      else if (isCurrent) status = 'ongoing'
      else if (isUpcoming) status = 'upcoming'

      return { ...stage, status }
    })

    return {
      completed: completedStages,
      total: totalStages,
      percentage,
      currentStage,
      stages
    }
  }

  const getStageIcon = (stageKey: string) => {
    const iconMap = {
      order_processing: FileText,
      material_procurement: Package,
      cutting: Shirt,
      sewing_assembly: Settings,
      quality_control: CheckCircle,
      finishing: Package,
      dispatch: Truck,
      delivered: CheckCircle
    }
    return iconMap[stageKey as keyof typeof iconMap] || FileText
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Button asChild>
            <Link href={`/customers/${customerId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { order, items, workOrders } = orderDetails
  const progress = getProductionProgress()

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link href={`/customers/${customerId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-gray-600">Order Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Order Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{order.orderNumber}</CardTitle>
              <CardDescription className="text-gray-600">
                Placed on {formatDate(order.orderDate)}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
              <p className="text-lg font-bold text-gray-900">{order.totalAmount}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Date</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Target Delivery</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(order.targetDeliveryDate)}</p>
              </div>
            </div>
            {order.actualDeliveryDate && (
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Actual Delivery</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(order.actualDeliveryDate)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Created By</p>
                <p className="text-sm font-semibold text-gray-900">{order.createdBy}</p>
              </div>
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Order Notes
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border">
                  {order.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Production Progress */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-lg font-bold text-gray-900">Production Progress</CardTitle>
          <CardDescription className="text-gray-600">
            Track your order through the production stages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{progress.completed}/{progress.total} Stages</span>
            </div>
            <Progress value={progress.percentage} className="h-3" />
            <p className="text-xs text-gray-600 text-center">
              {Math.round(progress.percentage)}% Complete
            </p>
          </div>

          <Separator />

          {/* Visual Progress Stages */}
          <div className="space-y-4">
            {progress.stages.map((stage, index) => {
              const Icon = getStageIcon(stage.key)
              const isCompleted = stage.status === 'completed'
              const isOngoing = stage.status === 'ongoing'
              const isUpcoming = stage.status === 'upcoming'

              return (
                <div key={stage.key} className="flex items-start space-x-4">
                  {/* Stage Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-100 border-2 border-green-300' :
                    isOngoing ? 'bg-blue-100 border-2 border-blue-300' :
                    'bg-gray-100 border-2 border-gray-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isCompleted ? 'text-green-600' :
                      isOngoing ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{stage.label}</h4>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {isOngoing && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            Ongoing
                          </Badge>
                        )}
                        {isUpcoming && (
                          <Badge variant="outline" className="text-gray-500">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Connection Line */}
                  {index < progress.stages.length - 1 && (
                    <div className={`absolute left-6 top-12 w-0.5 h-8 ${
                      isCompleted ? 'bg-green-200' : 'bg-gray-200'
                    }`} style={{ marginLeft: '22px' }} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="text-lg font-bold text-gray-900">
            Order Items ({items.length})
          </CardTitle>
          <CardDescription className="text-gray-600">
            Details of items in your order
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-6 bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-xl mb-4 text-gray-900">{item.productName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Quantity:</span>
                        <span className="ml-2 font-semibold text-gray-900">{item.quantity}</span>
                      </div>
                    </div>
                    {item.size && (
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Shirt className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Size:</span>
                          <span className="ml-2 font-semibold text-gray-900">{item.size}</span>
                        </div>
                      </div>
                    )}
                    {item.color && (
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-gray-300"
                          style={{ backgroundColor: item.color.toLowerCase() }}
                        />
                        <div>
                          <span className="font-medium text-gray-600">Color:</span>
                          <span className="ml-2 font-semibold text-gray-900">{item.color}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {item.specifications && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <h5 className="font-medium text-gray-900 mb-2">Specifications:</h5>
                      <p className="text-sm text-gray-700">{item.specifications}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}