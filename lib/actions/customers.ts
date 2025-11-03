'use server'

import { db } from '@/db'
import { customers } from '@/db/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

export type CustomerFormData = {
  name: string
  contactPerson: string
  email: string
  phone: string
  address?: string
  shippingAddress?: string
  status?: 'active' | 'inactive' | 'prospect'
}

export async function getCustomers() {
  try {
    const result = await db.select()
      .from(customers)
      .orderBy(desc(customers.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: 'Failed to fetch customers' }
  }
}

export async function getCustomerById(id: string) {
  try {
    const result = await db.select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)

    if (result.length === 0) {
      return { success: false, error: 'Customer not found' }
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { success: false, error: 'Failed to fetch customer' }
  }
}

export async function createCustomer(data: CustomerFormData) {
  try {
    // Check for duplicate email
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.email, data.email))
      .limit(1)

    if (existingCustomer.length > 0) {
      return { success: false, error: 'A customer with this email already exists' }
    }

    const newCustomer = {
      id: nanoid(),
      name: data.name,
      contactPerson: data.contactPerson,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      address: data.address || null,
      shippingAddress: data.shippingAddress || null,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.insert(customers).values(newCustomer).returning()

    revalidatePath('/customers')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>) {
  try {
    // Check if customer exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1)

    if (existingCustomer.length === 0) {
      return { success: false, error: 'Customer not found' }
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email !== existingCustomer[0].email) {
      const duplicateCustomer = await db.select()
        .from(customers)
        .where(eq(customers.email, data.email))
        .limit(1)

      if (duplicateCustomer.length > 0) {
        return { success: false, error: 'A customer with this email already exists' }
      }
    }

    const updateData = {
      ...data,
      email: data.email ? data.email.toLowerCase().trim() : undefined,
      updatedAt: new Date(),
    }

    const result = await db
      .update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning()

    revalidatePath('/customers')
    return { success: true, data: result[0] }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { success: false, error: 'Failed to update customer' }
  }
}

export async function deleteCustomer(id: string) {
  try {
    // Import salesOrders here to avoid circular dependencies
    const { salesOrders } = await import('@/db/schema')

    // Check if customer has any related sales orders
    const relatedOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, id))
      .limit(1)

    if (relatedOrders[0]?.count > 0) {
      return {
        success: false,
        error: `Cannot delete customer: This customer has ${relatedOrders[0].count} associated sales order(s). Please delete or reassign the orders first.`
      }
    }

    // If no related records, proceed with deletion
    await db.delete(customers).where(eq(customers.id, id))

    revalidatePath('/customers')
    return { success: true, message: 'Customer deleted successfully' }
  } catch (error) {
    console.error('Error deleting customer:', error)

    // Handle foreign key constraint violation
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return {
        success: false,
        error: 'Cannot delete customer: This customer is referenced by other records. Please delete related records first.'
      }
    }

    return { success: false, error: 'Failed to delete customer' }
  }
}

export async function searchCustomers(query: string) {
  try {
    if (!query.trim()) {
      return { success: true, data: [] }
    }

    const result = await db.select()
      .from(customers)
      .where(
        sql`${customers.name} ILIKE ${`%${query}%`} OR
               ${customers.contactPerson} ILIKE ${`%${query}%`} OR
               ${customers.email} ILIKE ${`%${query}%`} OR
               ${customers.phone} ILIKE ${`%${query}%`}`
      )
      .orderBy(desc(customers.createdAt))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error searching customers:', error)
    return { success: false, error: 'Failed to search customers' }
  }
}

export async function getCustomerStats() {
  try {
    const totalCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)

    const activeCustomers = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(eq(customers.status, 'active'))

    return {
      success: true,
      data: {
        total: totalCustomers[0]?.count || 0,
        active: activeCustomers[0]?.count || 0
      }
    }
  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return { success: false, error: 'Failed to fetch customer statistics' }
  }
}

export async function getCustomerOrderCount(customerId: string) {
  try {
    const { salesOrders } = await import('@/db/schema')

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId))
      .limit(1)

    return {
      success: true,
      data: result[0]?.count || 0
    }
  } catch (error) {
    console.error('Error fetching customer order count:', error)
    return { success: false, error: 'Failed to fetch customer order count' }
  }
}

export async function getCustomerOrders(customerId: string) {
  try {
    const { salesOrders } = await import('@/db/schema')

    const result = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId))
      .orderBy(desc(salesOrders.orderDate))
      .limit(50) // Limit to last 50 orders for performance

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    return { success: false, error: 'Failed to fetch customer orders' }
  }
}

export async function getCustomerOrderStats(customerId: string) {
  try {
    const { salesOrders } = await import('@/db/schema')

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId))

    const completedOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(and(
        eq(salesOrders.customerId, customerId),
        eq(salesOrders.status, 'completed')
      ))

    const totalValue = await db
      .select({
        total: sql<number>`SUM(${salesOrders.totalAmount})`
      })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId))

    const lastOrder = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.customerId, customerId))
      .orderBy(desc(salesOrders.orderDate))
      .limit(1)

    return {
      success: true,
      data: {
        totalOrders: totalOrders[0]?.count || 0,
        completedOrders: completedOrders[0]?.count || 0,
        totalValue: totalValue[0]?.total || 0,
        lastOrderDate: lastOrder[0]?.orderDate || null,
        lastOrderStatus: lastOrder[0]?.status || null
      }
    }
  } catch (error) {
    console.error('Error fetching customer order stats:', error)
    return { success: false, error: 'Failed to fetch customer order statistics' }
  }
}