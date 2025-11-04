'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ShoppingCart,
  Package,
  DollarSign
} from 'lucide-react'
import { createSalesOrder, updateSalesOrder, generateOrderNumber, getSalesOrderById } from '@/lib/actions/sales-orders'
import { getCustomers } from '@/lib/actions/customers'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface OrderItem {
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

interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
}

interface SalesOrderFormProps {
  orderId?: string
  isEdit?: boolean
}

export function SalesOrderForm({ orderId, isEdit = false }: SalesOrderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersLoading, setCustomersLoading] = useState(true)

  // Form state
  const [orderNumber, setOrderNumber] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [orderDate, setOrderDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'draft' | 'processing' | 'completed' | 'cancelled'>('draft')

  // Order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // New item form
  const [newItem, setNewItem] = useState({
    productName: '',
    quantity: 1,
    size: '',
    color: '',
    unitPrice: '',
    specifications: ''
  })

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const initialize = async () => {
      await fetchCustomers()
      if (orderId && isEdit) {
        await fetchOrder()
      } else {
        const result = await generateOrderNumber()
        if (result.success && result.data) {
          setOrderNumber(result.data)
        }
      }
    }
    initialize()
  }, [orderId, isEdit])

  useEffect(() => {
    if (customerSearch.trim()) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(customerSearch.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  const fetchCustomers = async () => {
    try {
      const result = await getCustomers()
      if (result.success && result.data) {
        setCustomers(result.data)
        setFilteredCustomers(result.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch customers',
        variant: 'destructive',
      })
    } finally {
      setCustomersLoading(false)
    }
  }

  const fetchOrder = async () => {
    if (!orderId) return

    try {
      const result = await getSalesOrderById(orderId)
      if (result.success && result.data) {
        const order = result.data
        setOrderNumber(order.orderNumber)
        setCustomerId(order.customerId)
        setOrderDate(format(new Date(order.orderDate), 'yyyy-MM-dd'))
        setTargetDeliveryDate(format(new Date(order.targetDeliveryDate), 'yyyy-MM-dd'))
        setNotes(order.notes || '')
        setStatus(order.status)
        setOrderItems(order.items.map((item: any) => ({
          ...item,
          id: item.id,
          totalPrice: item.totalPrice,
          unitPrice: item.unitPrice
        })))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      })
    }
  }

  
  const addOrderItem = () => {
    if (!newItem.productName || !newItem.unitPrice || newItem.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields for the order item',
        variant: 'destructive',
      })
      return
    }

    const totalPrice = (parseFloat(newItem.unitPrice) * newItem.quantity).toString()
    const orderItem: OrderItem = {
      id: Date.now().toString(),
      salesOrderId: 'temp', // Will be set when order is created
      productName: newItem.productName,
      quantity: newItem.quantity,
      size: newItem.size || null,
      color: newItem.color || null,
      designFileUrl: null,
      unitPrice: newItem.unitPrice,
      totalPrice,
      specifications: newItem.specifications || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setOrderItems([...orderItems, orderItem])

    // Reset new item form
    setNewItem({
      productName: '',
      quantity: 1,
      size: '',
      color: '',
      unitPrice: '',
      specifications: ''
    })
  }

  const removeOrderItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + parseFloat(item.totalPrice || '0'), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orderNumber || !customerId || !targetDeliveryDate || orderItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields and add at least one order item',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const orderData = {
        orderNumber,
        customerId,
        orderDate,
        targetDeliveryDate,
        notes: notes.trim() || undefined,
        items: orderItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          size: item.size || undefined,
          color: item.color || undefined,
          unitPrice: item.unitPrice,
          specifications: item.specifications || undefined
        }))
      }

      let result
      if (isEdit && orderId) {
        result = await updateSalesOrder(orderId, orderData)
      } else {
        result = await createSalesOrder(orderData)
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: isEdit ? 'Sales order updated successfully' : 'Sales order created successfully',
        })
        router.push('/sales-orders')
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
        description: 'Failed to save sales order',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num)
  }

  const selectedCustomer = customers.find(c => c.id === customerId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/sales-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              {isEdit ? 'Edit Sales Order' : 'New Sales Order'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? 'Update sales order information' : 'Create a new sales order'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>
                Basic information about the sales order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Auto-generated"
                  disabled={isEdit}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="targetDeliveryDate">Target Delivery Date</Label>
                <Input
                  id="targetDeliveryDate"
                  type="date"
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this order..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Select the customer for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerSearch">Search Customer</Label>
                <Input
                  id="customerSearch"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by name or contact person..."
                />
              </div>

              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.contactPerson}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Customer</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedCustomer.name}</div>
                    <div><strong>Contact:</strong> {selectedCustomer.contactPerson}</div>
                    <div><strong>Email:</strong> {selectedCustomer.email}</div>
                    <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              Add products and specifications to this order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Item */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Add New Item</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={newItem.productName}
                    onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>

                <div>
                  <Label htmlFor="unitPrice">Unit Price *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={newItem.size}
                    onChange={(e) => setNewItem({...newItem, size: e.target.value})}
                    placeholder="e.g., M, L, XL"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={newItem.color}
                    onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                    placeholder="e.g., Red, Blue"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  value={newItem.specifications}
                  onChange={(e) => setNewItem({...newItem, specifications: e.target.value})}
                  placeholder="Additional specifications..."
                  rows={2}
                />
              </div>

              <Button type="button" onClick={addOrderItem} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-4">Order Items ({orderItems.length})</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div>{item.productName}</div>
                                {item.specifications && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.specifications}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.size || '-'}</TableCell>
                            <TableCell>{item.color || '-'}</TableCell>
                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.totalPrice)}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOrderItem(item.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={5} className="font-semibold">
                            Total Order Value
                          </TableCell>
                          <TableCell className="text-right font-bold text-lg">
                            {formatCurrency(calculateTotal())}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </>
            )}

            {orderItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added to this order yet.</p>
                <p className="text-sm">Add items using the form above.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/sales-orders">
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : (isEdit ? 'Update Order' : 'Create Order')}
          </Button>
        </div>
      </form>
    </div>
  )
}