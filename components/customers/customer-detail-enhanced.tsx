'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  Edit,
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { getCustomerOrders, getCustomerOrderStats } from '@/lib/actions/customers'
import { OrderHistory } from './order-history'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address?: string | null
  shippingAddress?: string | null
  status: 'active' | 'inactive' | 'prospect'
  createdAt: string | Date
  updatedAt: string | Date
}

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

interface CustomerOrderStats {
  totalOrders: number
  completedOrders: number
  lastOrderDate: string | Date | null
  lastOrderStatus: string | null
}

interface CustomerDetailEnhancedProps {
  customer: Customer
}

export function CustomerDetailEnhanced({ customer }: CustomerDetailEnhancedProps) {
  const { toast } = useToast()
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [orderStats, setOrderStats] = useState<CustomerOrderStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [ordersResult, statsResult] = await Promise.all([
          getCustomerOrders(customer.id),
          getCustomerOrderStats(customer.id)
        ])

        if (ordersResult.success && ordersResult.data) {
          setOrders(ordersResult.data)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch customer orders',
            variant: 'destructive',
          })
        }

        if (statsResult.success && statsResult.data) {
          setOrderStats(statsResult.data)
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch customer order statistics',
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch customer data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [customer.id])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      prospect: 'outline',
      draft: 'outline',
      processing: 'default',
      completed: 'default',
      cancelled: 'destructive',
    }

    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      prospect: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }

    return (
      <Badge className={statusColors[status] || variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  
  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/customers/${customer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">
            Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{customer.name}</CardTitle>
                      <CardDescription className="text-lg">
                        {customer.contactPerson}
                      </CardDescription>
                    </div>
                    {getStatusBadge(customer.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm">{customer.phone}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {customer.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Billing Address</p>
                          <p className="text-sm whitespace-pre-line">{customer.address}</p>
                        </div>
                      </div>
                    )}

                    {customer.shippingAddress && (
                      <div className="flex items-start space-x-3">
                        <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Shipping Address</p>
                          <p className="text-sm whitespace-pre-line">{customer.shippingAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p className="text-sm">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm">{formatDate(customer.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {orderStats && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Total Orders</p>
                        <p className="text-2xl font-bold">{orderStats.totalOrders}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Completed Orders</p>
                        <p className="text-2xl font-bold">{orderStats.completedOrders}</p>
                        <p className="text-xs text-muted-foreground">
                          {orderStats.totalOrders > 0
                            ? `${Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)}% completion rate`
                            : 'No orders yet'
                          }
                        </p>
                      </div>
                    </div>

                    {orderStats.lastOrderDate && (
                      <>
                        <Separator />
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Last Order</p>
                            <p className="text-sm">{formatDate(orderStats.lastOrderDate)}</p>
                            <p className="text-xs text-muted-foreground">
                              Status: {orderStats.lastOrderStatus}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/orders/new?customer=${customer.id}`}>
                      <Package className="mr-2 h-4 w-4" />
                      Create New Order
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/customers/${customer.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Customer
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <OrderHistory customerId={customer.id} customerName={customer.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}