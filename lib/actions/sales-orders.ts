'use server'

import { eq, and, ilike, desc, asc, sql } from 'drizzle-orm'
import { db } from '@/db'
import { salesOrders, salesOrderItems, customers } from '@/db/schema/business'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

export interface CreateSalesOrderData {
  orderNumber: string
  customerId: string
  orderDate: string | Date
  targetDeliveryDate: string | Date
  notes?: string
  items: {
    productName: string
    quantity: number
    size?: string
    color?: string
    specifications?: string
  }[]
}

export interface UpdateSalesOrderData {
  orderNumber?: string
  customerId?: string
  orderDate?: string | Date
  targetDeliveryDate?: string | Date
  actualDeliveryDate?: string | Date | null
  status?: 'draft' | 'on_review' | 'approve' | 'cancelled'
  notes?: string
}

export async function createSalesOrder(data: CreateSalesOrderData) {
  try {
    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Create the sales order
      const [newOrder] = await tx
        .insert(salesOrders)
        .values({
          id: nanoid(),
          orderNumber: data.orderNumber,
          customerId: data.customerId,
          orderDate: new Date(data.orderDate),
          targetDeliveryDate: new Date(data.targetDeliveryDate),
          notes: data.notes || null,
          status: 'draft',
          totalAmount: '0.00', // Set to 0 since we're not tracking prices
          createdBy: 'system', // TODO: Get from auth context
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Create order items
      const orderItems = await Promise.all(
        data.items.map(async (item) => {
          const [newItem] = await tx
            .insert(salesOrderItems)
            .values({
              id: nanoid(),
              salesOrderId: newOrder.id,
              productName: item.productName,
              quantity: item.quantity,
              size: item.size || null,
              color: item.color || null,
              unitPrice: '0.00', // Set to 0 since we're not tracking prices
              totalPrice: '0.00', // Set to 0 since we're not tracking prices
              specifications: item.specifications || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning()
          return newItem
        })
      )

      return {
        order: newOrder,
        items: orderItems,
      }
    })

    revalidatePath('/sales-orders')
    return {
      success: true,
      data: result.order,
    }
  } catch (error) {
    console.error('Error creating sales order:', error)
    return {
      success: false,
      error: 'Failed to create sales order',
    }
  }
}

export async function getSalesOrders() {
  try {
    const orders = await db
      .select({
        id: salesOrders.id,
        orderNumber: salesOrders.orderNumber,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        customerContactPerson: customers.contactPerson,
        orderDate: salesOrders.orderDate,
        targetDeliveryDate: salesOrders.targetDeliveryDate,
        actualDeliveryDate: salesOrders.actualDeliveryDate,
        status: salesOrders.status,
        totalAmount: salesOrders.totalAmount,
        notes: salesOrders.notes,
        createdAt: salesOrders.createdAt,
        updatedAt: salesOrders.updatedAt,
        itemCount: sql<number>`count(${salesOrderItems.id})`.as('itemCount'),
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(salesOrderItems, eq(salesOrders.id, salesOrderItems.salesOrderId))
      .groupBy(salesOrders.id, customers.id)
      .orderBy(desc(salesOrders.orderDate))

    return {
      success: true,
      data: orders,
    }
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    return {
      success: false,
      error: 'Failed to fetch sales orders',
    }
  }
}

export async function getSalesOrderById(id: string) {
  try {
    // Get the order details
    const [order] = await db
      .select({
        id: salesOrders.id,
        orderNumber: salesOrders.orderNumber,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        customerContactPerson: customers.contactPerson,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        orderDate: salesOrders.orderDate,
        targetDeliveryDate: salesOrders.targetDeliveryDate,
        actualDeliveryDate: salesOrders.actualDeliveryDate,
        status: salesOrders.status,
        totalAmount: salesOrders.totalAmount,
        notes: salesOrders.notes,
        createdBy: salesOrders.createdBy,
        createdAt: salesOrders.createdAt,
        updatedAt: salesOrders.updatedAt,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(eq(salesOrders.id, id))

    if (!order) {
      return {
        success: false,
        error: 'Sales order not found',
      }
    }

    // Get order items
    const items = await db
      .select()
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, id))
      .orderBy(asc(salesOrderItems.createdAt))

    return {
      success: true,
      data: {
        ...order,
        items,
      },
    }
  } catch (error) {
    console.error('Error fetching sales order:', error)
    return {
      success: false,
      error: 'Failed to fetch sales order',
    }
  }
}

export async function updateSalesOrder(id: string, data: UpdateSalesOrderData) {
  try {
    const updateData: any = {}

    if (data.orderNumber !== undefined) updateData.orderNumber = data.orderNumber
    if (data.customerId !== undefined) updateData.customerId = data.customerId
    if (data.orderDate !== undefined) updateData.orderDate = new Date(data.orderDate)
    if (data.targetDeliveryDate !== undefined) updateData.targetDeliveryDate = new Date(data.targetDeliveryDate)
    if (data.actualDeliveryDate !== undefined) updateData.actualDeliveryDate = data.actualDeliveryDate ? new Date(data.actualDeliveryDate) : null
    if (data.status !== undefined) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes

    const [updatedOrder] = await db
      .update(salesOrders)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(salesOrders.id, id))
      .returning()

    if (!updatedOrder) {
      return {
        success: false,
        error: 'Sales order not found',
      }
    }

    return {
      success: true,
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating sales order:', error)
    return {
      success: false,
      error: 'Failed to update sales order',
    }
  }
}

export async function deleteSalesOrder(id: string) {
  try {
    // Check if order has work orders or other dependencies
    // For now, we'll allow deletion but in production you might want to prevent it

    await db.transaction(async (tx) => {
      // Delete order items first
      await tx
        .delete(salesOrderItems)
        .where(eq(salesOrderItems.salesOrderId, id))

      // Delete the order
      await tx
        .delete(salesOrders)
        .where(eq(salesOrders.id, id))
    })

    return {
      success: true,
      message: 'Sales order deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting sales order:', error)
    return {
      success: false,
      error: 'Failed to delete sales order',
    }
  }
}

export async function searchSalesOrders(query: string, status?: string, customerId?: string) {
  try {
    const whereConditions: any[] = []

    if (query.trim()) {
      whereConditions.push(
        sql`(${salesOrders.orderNumber} ILIKE ${`%${query}%`} OR
              ${customers.name} ILIKE ${`%${query}%`} OR
              ${salesOrders.notes} ILIKE ${`%${query}%`})`
      )
    }

    if (status && status !== 'all') {
      whereConditions.push(eq(salesOrders.status, status as 'draft' | 'processing' | 'completed' | 'cancelled'))
    }

    if (customerId) {
      whereConditions.push(eq(salesOrders.customerId, customerId))
    }

    const orders = await db
      .select({
        id: salesOrders.id,
        orderNumber: salesOrders.orderNumber,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        customerContactPerson: customers.contactPerson,
        orderDate: salesOrders.orderDate,
        targetDeliveryDate: salesOrders.targetDeliveryDate,
        actualDeliveryDate: salesOrders.actualDeliveryDate,
        status: salesOrders.status,
        totalAmount: salesOrders.totalAmount,
        notes: salesOrders.notes,
        createdAt: salesOrders.createdAt,
        updatedAt: salesOrders.updatedAt,
        itemCount: sql<number>`count(${salesOrderItems.id})`.as('itemCount'),
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(salesOrderItems, eq(salesOrders.id, salesOrderItems.salesOrderId))
      .where(and(...whereConditions))
      .groupBy(salesOrders.id, customers.id)
      .orderBy(desc(salesOrders.orderDate))
      .limit(50)

    return {
      success: true,
      data: orders,
    }
  } catch (error) {
    console.error('Error searching sales orders:', error)
    return {
      success: false,
      error: 'Failed to search sales orders',
    }
  }
}

export async function getSalesOrderStats() {
  try {
    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)

    const statusCounts = await db
      .select({
        status: salesOrders.status,
        count: sql<number>`count(*)`,
      })
      .from(salesOrders)
      .groupBy(salesOrders.status)

    // Get total items count instead of total value
    const totalItems = await db
      .select({
        total: sql<number>`SUM(${salesOrderItems.quantity})`,
      })
      .from(salesOrderItems)
      .leftJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))

    const lastOrder = await db
      .select()
      .from(salesOrders)
      .orderBy(desc(salesOrders.createdAt))
      .limit(1)

    return {
      success: true,
      data: {
        totalOrders: totalOrders[0]?.count || 0,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = item.count
          return acc
        }, {} as Record<string, number>),
        totalItems: totalItems[0]?.total || 0,
        lastOrderDate: lastOrder[0]?.createdAt || null,
      },
    }
  } catch (error) {
    console.error('Error fetching sales order stats:', error)
    return {
      success: false,
      error: 'Failed to fetch sales order statistics',
    }
  }
}

export async function updateOrderStatus(id: string, status: 'draft' | 'on_review' | 'approve' | 'cancelled') {
  try {
    const [updatedOrder] = await db
      .update(salesOrders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(salesOrders.id, id))
      .returning()

    if (!updatedOrder) {
      return {
        success: false,
        error: 'Sales order not found',
      }
    }

    revalidatePath('/sales-orders')
    return {
      success: true,
      data: updatedOrder,
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: 'Failed to update order status',
    }
  }
}

export async function generateOrderNumber(): Promise<{
  success: boolean
  data?: string
  error?: string
}> {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // Get the latest order number for this month
    const latestOrder = await db
      .select({ orderNumber: salesOrders.orderNumber })
      .from(salesOrders)
      .where(sql`order_number LIKE ${`SO-${year}${month}-%`}`)
      .orderBy(desc(salesOrders.orderNumber))
      .limit(1)

    let sequence = 1
    if (latestOrder.length > 0) {
      const latestNumber = latestOrder[0].orderNumber
      const latestSequence = parseInt(latestNumber.split('-')[2])
      sequence = latestSequence + 1
    }

    const orderNumber = `SO-${year}${month}-${String(sequence).padStart(4, '0')}`

    return {
      success: true,
      data: orderNumber,
    }
  } catch (error) {
    console.error('Error generating order number:', error)
    return {
      success: false,
      error: 'Failed to generate order number',
    }
  }
}