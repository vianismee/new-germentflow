'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  Edit,
  ArrowLeft,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { getCustomerById } from '@/lib/actions/customers'
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

interface CustomerDetailProps {
  customer: Customer
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const { toast } = useToast()
  const [currentCustomer, setCurrentCustomer] = useState(customer)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      prospect: 'outline',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Link>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/customers/${currentCustomer.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{currentCustomer.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {currentCustomer.contactPerson}
                  </CardDescription>
                </div>
                {getStatusBadge(currentCustomer.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm">{currentCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm">{currentCustomer.phone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {currentCustomer.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Billing Address</p>
                      <p className="text-sm whitespace-pre-line">{currentCustomer.address}</p>
                    </div>
                  </div>
                )}

                {currentCustomer.shippingAddress && (
                  <div className="flex items-start space-x-3">
                    <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Shipping Address</p>
                      <p className="text-sm whitespace-pre-line">{currentCustomer.shippingAddress}</p>
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
                    <p className="text-sm">{formatDate(currentCustomer.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm">{formatDate(currentCustomer.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/orders/new?customer=${currentCustomer.id}`}>
                  <Package className="mr-2 h-4 w-4" />
                  Create New Order
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/customers/${currentCustomer.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Customer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}