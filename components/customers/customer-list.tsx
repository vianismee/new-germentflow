'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Plus, Eye } from 'lucide-react'
import { getCustomers, deleteCustomer, searchCustomers, getCustomerOrderCount } from '@/lib/actions/customers'
import { useToast } from '@/hooks/use-toast'
import { CustomerDialog, DeleteConfirmDialog } from '@/components/customers/customer-dialog'
import { useRouter } from 'next/navigation'

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

export function CustomerList() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { toast } = useToast()

  // Dialog states
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string; relatedOrdersCount: number } | undefined>()

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const result = searchQuery
        ? await searchCustomers(searchQuery)
        : await getCustomers()

      if (result.success && result.data) {
        let filteredCustomers = result.data

        // Apply status filter
        if (statusFilter !== 'all') {
          filteredCustomers = filteredCustomers.filter(
            (customer: Customer) => customer.status === statusFilter
          )
        }

        setCustomers(filteredCustomers)
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
        description: 'Failed to fetch customers',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchQuery, statusFilter])

  
  const handleDelete = async (id: string, name: string) => {
    // First check if customer has related orders
    const orderCountResult = await getCustomerOrderCount(id)

    const relatedOrdersCount = orderCountResult.success && orderCountResult.data !== undefined
      ? orderCountResult.data
      : 0

    // Set up delete dialog data
    setCustomerToDelete({
      id,
      name,
      relatedOrdersCount
    })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return

    try {
      const result = await deleteCustomer(customerToDelete.id)
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
        fetchCustomers()
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
        description: 'Failed to delete customer',
        variant: 'destructive',
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(undefined)
    }
  }

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

  const columns = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="flex items-center space-x-2">
            <Button
              variant="link"
              className="h-auto p-0 font-medium text-left"
              onClick={() => router.push(`/customers/${row.original.id}`)}
            >
              {row.getValue('name')}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">{row.original.contactPerson}</div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('email')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('phone')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => getStatusBadge(row.getValue('status')),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
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
            <DropdownMenuItem
              onClick={() => router.push(`/customers/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedCustomer(row.original)
                setIsCustomerDialogOpen(true)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(row.original.id, row.original.name)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('prospect')}>
                Prospect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => {
          setSelectedCustomer(undefined)
          setIsCustomerDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customers ({customers.length})</CardTitle>
          <CardDescription>
            Manage your customer database and track their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
            noResultsMessage={
              searchQuery || statusFilter !== 'all'
                ? 'No customers found matching your criteria'
                : 'No customers yet'
            }
          />
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <CustomerDialog
        isOpen={isCustomerDialogOpen}
        onClose={() => setIsCustomerDialogOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => {
          fetchCustomers()
          setSelectedCustomer(undefined)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCustomerToDelete(undefined)
        }}
        onConfirm={handleConfirmDelete}
        customerName={customerToDelete?.name || ''}
        relatedOrdersCount={customerToDelete?.relatedOrdersCount}
      />
    </div>
  )
}