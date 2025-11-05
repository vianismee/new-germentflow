'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  ArrowLeft,
  Wrench,
  ShoppingCart,
  Plus,
  RotateCcw,
  Calendar,
  Settings
} from 'lucide-react'
import { getApprovedSalesOrdersForWorkOrders, createWorkOrderFromSalesOrderItem, createBulkWorkOrders } from '@/lib/actions/work-orders'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  isUrgent?: boolean
}

export function WorkOrderNewPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [allSalesOrders, setAllSalesOrders] = useState<SalesOrder[]>([]) // Store all orders for client-side filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [urgentOnlyFilter, setUrgentOnlyFilter] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchSalesOrders = useCallback(async () => {
    try {
      const result = await getApprovedSalesOrdersForWorkOrders()
      if (result.success && result.data) {
        const ordersWithUrgency = result.data.map(order => ({
          ...order,
          isUrgent: new Date(order.targetDeliveryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }))
        setAllSalesOrders(ordersWithUrgency) // Store all orders
        setSalesOrders(ordersWithUrgency) // Set filtered orders initially
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch sales orders',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const applyClientSideFilters = useCallback(() => {
    let filteredOrders = allSalesOrders

    // Apply urgent filter
    if (urgentOnlyFilter) {
      filteredOrders = filteredOrders.filter(order => order.isUrgent)
    }

    // Apply search filter
    if (searchQuery && searchQuery.length >= 2) {
      const lowerSearchQuery = searchQuery.toLowerCase()
      filteredOrders = filteredOrders.filter(order => {
        // Check if search matches order number
        if (order.orderNumber?.toLowerCase().includes(lowerSearchQuery)) {
          return true
        }

        // Check if search matches customer name
        if (order.customerName?.toLowerCase().includes(lowerSearchQuery)) {
          return true
        }

        // Check if search matches any item in the order
        return order.items?.some(item =>
          item.productName?.toLowerCase().includes(lowerSearchQuery) ||
          item.color?.toLowerCase().includes(lowerSearchQuery) ||
          item.size?.toLowerCase().includes(lowerSearchQuery)
        )
      })
    }

    setSalesOrders(filteredOrders)
  }, [allSalesOrders, urgentOnlyFilter, searchQuery])

  const fetchFilteredSalesOrders = useCallback(async () => {
    try {
      // Use client-side filtering as primary method
      applyClientSideFilters()

      // Only use server-side filtering as fallback for large datasets
      // if (allSalesOrders.length > 100) {
      //   try {
      //     console.log('Using server-side filtering for large dataset')
      //     const filters = {
      //       searchTerm: searchQuery || undefined,
      //       urgentOnly: urgentOnlyFilter || undefined,
      //     }
      //     const result = await getApprovedSalesOrdersForWorkOrdersWithFilters(filters)
      //     if (result.success && result.data) {
      //       const ordersWithUrgency = result.data.map(order => ({
      //         ...order,
      //         isUrgent: new Date(order.targetDeliveryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      //       }))
      //       setSalesOrders(ordersWithUrgency)
      //     }
      //   } catch (error) {
      //     console.log('Server-side filtering failed, using client-side fallback')
      //     applyClientSideFilters()
      //   }
      // }
    } catch {
      applyClientSideFilters() // Always fall back to client-side
    }
  }, [applyClientSideFilters])

  // Now add the useEffects after the functions
  useEffect(() => {
    fetchSalesOrders()
  }, [fetchSalesOrders])

  // Apply filters after data is loaded
  useEffect(() => {
    if (allSalesOrders.length > 0) {
      applyClientSideFilters()
    }
  }, [allSalesOrders.length, searchQuery, urgentOnlyFilter, applyClientSideFilters])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (allSalesOrders.length > 0) {
        fetchFilteredSalesOrders()
      }
    }, 800) // Increased debounce delay to 800ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery, urgentOnlyFilter, allSalesOrders.length, fetchFilteredSalesOrders])

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleSelectAllItems = (checked: boolean) => {
    if (checked) {
      const allItemIds = salesOrders.flatMap(order =>
        order.items?.map(item => item.id) || []
      )
      console.log('Selecting all filtered items:', allItemIds)
      setSelectedItems(allItemIds)
    } else {
      console.log('Deselecting all items')
      setSelectedItems([])
    }
  }

  const handleCreateSelected = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to convert to work orders',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing

      const result = await createBulkWorkOrders(selectedItems, userId)

      if (result.success) {
        const { successful, failed, total } = result.data?.summary || { successful: 0, failed: 0, total: 0 }

        toast({
          title: 'Work Orders Created',
          description: `Successfully created ${successful} of ${total} work orders${failed > 0 ? ` (${failed} failed)` : ''}`,
          variant: failed > 0 ? 'default' : 'default',
        })

        // Refresh the data to remove converted items
        fetchFilteredSalesOrders()
        setSelectedItems([])

        // If all items were successfully converted, redirect to work orders list
        if (successful === total && successful > 0) {
          setTimeout(() => {
            router.push('/work-orders')
          }, 2000)
        }
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
        description: 'Failed to create work orders',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateSingle = async (itemId: string) => {
    setIsCreating(true)
    try {
      // TODO: Get actual user ID from authentication
      const userId = 'system-user' // Temporary user ID for testing
      const result = await createWorkOrderFromSalesOrderItem(itemId, userId)

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })

        // Refresh the data to remove converted items
        fetchFilteredSalesOrders()
        setSelectedItems(prev => prev.filter(id => id !== itemId))
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
        description: 'Failed to create work order',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setUrgentOnlyFilter(false)
  }

  const totalItems = salesOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
  const totalAllItems = allSalesOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              Create Work Orders
            </h1>
            <p className="text-muted-foreground">
              Convert approved sales orders to work orders
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Sales Orders</CardTitle>
              <CardDescription>
                {searchQuery || urgentOnlyFilter
                  ? `Showing ${salesOrders.length} of ${allSalesOrders.length} sales orders (${totalItems} items) available for conversion`
                  : `${salesOrders.length} approved sales orders with ${totalAllItems} items available for conversion`
                }
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type 2+ characters to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent-only"
                  checked={urgentOnlyFilter}
                  onCheckedChange={(checked) => setUrgentOnlyFilter(checked as boolean)}
                />
                <label htmlFor="urgent-only" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Urgent only (≤ 7 days)
                </label>
              </div>
              {(searchQuery || urgentOnlyFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
              {searchQuery && searchQuery.length === 1 && (
                <span className="text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bulk Actions */}
      {totalItems > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={totalItems > 0 && selectedItems.length === totalItems}
                  onCheckedChange={handleSelectAllItems}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({selectedItems.length} of {totalItems} items)
                </label>
              </div>
              <Button
                onClick={handleCreateSelected}
                disabled={selectedItems.length === 0 || isCreating}
                className="min-w-[160px]"
              >
                {isCreating ? (
                  <>
                    <Settings className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 h-4 w-4" />
                    Create {selectedItems.length} Work Order{selectedItems.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Orders and Items Table */}
      <Card>
        <CardContent className="p-0">
          {totalItems === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No items available for conversion
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || urgentOnlyFilter
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Approve some sales orders first to create work orders.'
                }
              </p>
              {!(searchQuery || urgentOnlyFilter) && (
                <Button asChild>
                  <Link href="/sales-orders">
                    <Plus className="mr-2 h-4 w-4" />
                    Go to Sales Orders
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Sales Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Specifications</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Target Delivery</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.map((order) => (
                    order.items?.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{order.orderNumber}</span>
                            {order.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.quantity} units</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className={order.isUrgent ? 'text-red-600 font-medium' : ''}>
                              {format(new Date(order.targetDeliveryDate), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleCreateSingle(item.id)}
                            disabled={isCreating || selectedItems.includes(item.id)}
                            variant="outline"
                          >
                            {isCreating && selectedItems.includes(item.id) ? (
                              <>
                                <Settings className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <Wrench className="mr-2 h-4 w-4" />
                                Convert
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}