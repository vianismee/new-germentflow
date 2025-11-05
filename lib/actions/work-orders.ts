'use server'

import { db } from '@/db'
import { workOrders, productionStageHistory, salesOrders, salesOrderItems, customers } from '@/db/schema/business'
import { eq, and, desc, asc, sql, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// Work Order Types
export interface WorkOrder {
  id: string
  workOrderNumber: string
  salesOrderId: string
  salesOrderItemId: string
  currentStage: 'order_processing' | 'material_procurement' | 'cutting' | 'sewing_assembly' | 'quality_control' | 'finishing' | 'dispatch' | 'delivered'
  startedAt?: Date | null
  completedAt?: Date | null
  estimatedCompletion?: Date | null
  priority: number
  assignedTo?: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  // Joined fields
  salesOrderNumber?: string
  customerName?: string
  productName?: string
  quantity?: number
  size?: string | null
  color?: string | null
}

export interface ProductionStage {
  stage: string
  startedAt: Date
  completedAt?: Date | null
  duration?: number | null
  notes?: string | null
  userId: string
}

// Create Work Order from Sales Order Item
export async function createWorkOrderFromSalesOrderItem(
  salesOrderItemId: string,
  createdBy: string,
  options: {
    priority?: number
    estimatedCompletion?: Date
    assignedTo?: string
  } = {}
) {
  try {
    console.log('=== Creating Work Order ===')
    console.log('Sales order item ID:', salesOrderItemId)
    console.log('Created by:', createdBy)

    // Get sales order item details with sales order info
    const [salesOrderItem] = await db
      .select({
        id: salesOrderItems.id,
        salesOrderId: salesOrderItems.salesOrderId,
        productName: salesOrderItems.productName,
        quantity: salesOrderItems.quantity,
        size: salesOrderItems.size,
        color: salesOrderItems.color,
        salesOrderStatus: salesOrders.status,
        salesOrderNumber: salesOrders.orderNumber,
      })
      .from(salesOrderItems)
      .leftJoin(salesOrders, eq(salesOrderItems.salesOrderId, salesOrders.id))
      .where(eq(salesOrderItems.id, salesOrderItemId))

    console.log('Sales order item found:', salesOrderItem)

    if (!salesOrderItem) {
      return { success: false, error: 'Sales order item not found' }
    }

    if (salesOrderItem.salesOrderStatus !== 'approve') {
      return { success: false, error: 'Can only create work orders from approved sales orders' }
    }

    // Check if work order already exists for this item
    const [existingWorkOrder] = await db
      .select()
      .from(workOrders)
      .where(eq(workOrders.salesOrderItemId, salesOrderItemId))

    if (existingWorkOrder) {
      return { success: false, error: 'Work order already exists for this sales order item' }
    }

    // Generate work order number
    const workOrderNumber = `WO-${Date.now().toString().slice(-6)}`

    console.log('Creating work order:', workOrderNumber)

    // Create work order
    const [newWorkOrder] = await db.insert(workOrders).values({
      id: nanoid(),
      workOrderNumber,
      salesOrderId: salesOrderItem.salesOrderId,
      salesOrderItemId,
      currentStage: 'order_processing',
      startedAt: new Date(),
      priority: options.priority || 5,
      assignedTo: options.assignedTo,
      estimatedCompletion: options.estimatedCompletion,
      createdBy,
    }).returning()

    console.log('Work order created:', newWorkOrder)

    // Create initial production stage history
    await db.insert(productionStageHistory).values({
      id: nanoid(),
      workOrderId: newWorkOrder.id,
      stage: 'order_processing',
      startedAt: new Date(),
      userId: createdBy,
    })

    console.log('Production stage history created')

    revalidatePath('/work-orders')

    return {
      success: true,
      data: newWorkOrder,
      message: `Work order ${workOrderNumber} created successfully`
    }
  } catch (error) {
    console.error('Error creating work order:', error)
    return { success: false, error: 'Failed to create work order', details: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get all work orders
export async function getWorkOrders() {
  try {
    
    // Use a simpler approach - first get basic work order data, then enhance it
    const basicWorkOrders = await db
      .select({
        id: workOrders.id,
        workOrderNumber: workOrders.workOrderNumber,
        salesOrderId: workOrders.salesOrderId,
        salesOrderItemId: workOrders.salesOrderItemId,
        currentStage: workOrders.currentStage,
        startedAt: workOrders.startedAt,
        completedAt: workOrders.completedAt,
        estimatedCompletion: workOrders.estimatedCompletion,
        priority: workOrders.priority,
        assignedTo: workOrders.assignedTo,
        createdBy: workOrders.createdBy,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
      })
      .from(workOrders)
      .orderBy(desc(workOrders.createdAt))

    console.log('Basic work orders found:', basicWorkOrders.length)

    if (basicWorkOrders.length === 0) {
      return { success: true, data: [] }
    }

    // Now enhance with related data using separate queries to avoid JOIN issues
    const enhancedWorkOrders = await Promise.all(
      basicWorkOrders.map(async (workOrder) => {
        try {
          // Get related sales order and item data
          const [salesOrder, salesOrderItem] = await Promise.all([
            db
              .select({
                id: salesOrders.id,
                orderNumber: salesOrders.orderNumber,
                customerId: salesOrders.customerId,
              })
              .from(salesOrders)
              .where(eq(salesOrders.id, workOrder.salesOrderId))
              .limit(1),
            db
              .select({
                id: salesOrderItems.id,
                productName: salesOrderItems.productName,
                quantity: salesOrderItems.quantity,
                size: salesOrderItems.size,
                color: salesOrderItems.color,
              })
              .from(salesOrderItems)
              .where(eq(salesOrderItems.id, workOrder.salesOrderItemId))
              .limit(1),
          ])

          // Get customer name if we have a customerId
          let customerName = 'Unknown Customer'
          if (salesOrder[0]?.customerId) {
            const customerData = await db
              .select({
                name: customers.name,
              })
              .from(customers)
              .where(eq(customers.id, salesOrder[0].customerId))
              .limit(1)

            if (customerData[0]?.name) {
              customerName = customerData[0].name
            }
          }

          return {
            ...workOrder,
            salesOrderNumber: salesOrder[0]?.orderNumber || 'Unknown',
            customerName,
            productName: salesOrderItem[0]?.productName || 'Unknown Product',
            quantity: salesOrderItem[0]?.quantity || 0,
            size: salesOrderItem[0]?.size || null,
            color: salesOrderItem[0]?.color || null,
          }
        } catch (error) {
          console.error('Error enhancing work order:', workOrder.id, error)
          // Return basic data if enhancement fails
          return {
            ...workOrder,
            salesOrderNumber: 'Unknown',
            customerName: 'Unknown Customer',
            productName: 'Unknown Product',
            quantity: 0,
            size: null,
            color: null,
          }
        }
      })
    )

    console.log('Enhanced work orders:', enhancedWorkOrders)
    return { success: true, data: enhancedWorkOrders }

  } catch (error) {
    console.error('Error fetching work orders:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return { success: false, error: 'Failed to fetch work orders', details: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get work order by ID
export async function getWorkOrderById(id: string) {
  try {
    // Get basic work order data first
    const basicWorkOrderData = await db
      .select({
        id: workOrders.id,
        workOrderNumber: workOrders.workOrderNumber,
        salesOrderId: workOrders.salesOrderId,
        salesOrderItemId: workOrders.salesOrderItemId,
        currentStage: workOrders.currentStage,
        startedAt: workOrders.startedAt,
        completedAt: workOrders.completedAt,
        estimatedCompletion: workOrders.estimatedCompletion,
        priority: workOrders.priority,
        assignedTo: workOrders.assignedTo,
        createdBy: workOrders.createdBy,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
      })
      .from(workOrders)
      .where(eq(workOrders.id, id))
      .limit(1)

    if (basicWorkOrderData.length === 0) {
      return { success: false, error: 'Work order not found' }
    }

    const workOrder = basicWorkOrderData[0]

    // Get related data using separate queries
    const [salesOrder, salesOrderItem] = await Promise.all([
      db
        .select({
          id: salesOrders.id,
          orderNumber: salesOrders.orderNumber,
          customerId: salesOrders.customerId,
        })
        .from(salesOrders)
        .where(eq(salesOrders.id, workOrder.salesOrderId))
        .limit(1),
      db
        .select({
          id: salesOrderItems.id,
          productName: salesOrderItems.productName,
          quantity: salesOrderItems.quantity,
          size: salesOrderItems.size,
          color: salesOrderItems.color,
        })
        .from(salesOrderItems)
        .where(eq(salesOrderItems.id, workOrder.salesOrderItemId))
        .limit(1),
    ])

    // Get customer name if we have a customerId
    let customerName = 'Unknown Customer'
    if (salesOrder[0]?.customerId) {
      const customerData = await db
        .select({
          name: customers.name,
        })
        .from(customers)
        .where(eq(customers.id, salesOrder[0].customerId))
        .limit(1)

      if (customerData[0]?.name) {
        customerName = customerData[0].name
      }
    }

    // Get production stage history
    const stageHistory = await db
      .select()
      .from(productionStageHistory)
      .where(eq(productionStageHistory.workOrderId, id))
      .orderBy(asc(productionStageHistory.createdAt))

    // Combine all data
    const enhancedWorkOrder = {
      ...workOrder,
      salesOrderNumber: salesOrder[0]?.orderNumber || 'Unknown',
      customerName,
      productName: salesOrderItem[0]?.productName || 'Unknown Product',
      quantity: salesOrderItem[0]?.quantity || 0,
      size: salesOrderItem[0]?.size || null,
      color: salesOrderItem[0]?.color || null,
      stageHistory
    }

    return {
      success: true,
      data: enhancedWorkOrder
    }
  } catch (error) {
    console.error('Error fetching work order:', error)
    return { success: false, error: 'Failed to fetch work order' }
  }
}

// Start a production stage
export async function startProductionStage(
  workOrderId: string,
  stage: string,
  userId: string,
  notes?: string
) {
  try {
    // Check if stage is already started
    const existingStage = await db
      .select()
      .from(productionStageHistory)
      .where(
        and(
          eq(productionStageHistory.workOrderId, workOrderId),
          eq(productionStageHistory.stage, stage as any),
          sql`${productionStageHistory.completedAt} IS NULL`
        )
      )
      .limit(1)

    if (existingStage.length > 0) {
      return { success: false, error: 'Stage already started' }
    }

    // Create new stage history entry
    const [newStageHistory] = await db.insert(productionStageHistory).values({
      id: nanoid(),
      workOrderId,
      stage: stage as any,
      startedAt: new Date(),
      userId,
      notes,
    }).returning()

    // Update work order current stage if this is the first stage or resuming
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set({
        currentStage: stage as any,
        updatedAt: new Date(),
        startedAt: stage === 'order_processing' ? new Date() : undefined,
      })
      .where(eq(workOrders.id, workOrderId))
      .returning()

    revalidatePath('/work-orders')
    revalidatePath(`/work-orders/${workOrderId}`)

    return {
      success: true,
      data: { stageHistory: newStageHistory, workOrder: updatedWorkOrder },
      message: `${stage.replace('_', ' ')} stage started`
    }
  } catch (error) {
    console.error('Error starting production stage:', error)
    return { success: false, error: 'Failed to start production stage' }
  }
}

// Finish a production stage
export async function finishProductionStage(
  workOrderId: string,
  stage: string,
  userId: string,
  notes?: string
) {
  try {
    // Get the current active stage
    const currentStage = await db
      .select()
      .from(productionStageHistory)
      .where(
        and(
          eq(productionStageHistory.workOrderId, workOrderId),
          eq(productionStageHistory.stage, stage as any),
          sql`${productionStageHistory.completedAt} IS NULL`
        )
      )
      .limit(1)

    if (currentStage.length === 0) {
      return { success: false, error: 'Stage not found or already completed' }
    }

    // Calculate duration in minutes
    const startedAt = new Date(currentStage[0].startedAt)
    const completedAt = new Date()
    const duration = Math.floor((completedAt.getTime() - startedAt.getTime()) / (1000 * 60))

    // Update the stage with completion data
    const [updatedStageHistory] = await db
      .update(productionStageHistory)
      .set({
        completedAt,
        duration,
        notes: notes || currentStage[0].notes,
      })
      .where(eq(productionStageHistory.id, currentStage[0].id))
      .returning()

    // Determine next stage
    const stages = [
      'order_processing',
      'material_procurement',
      'cutting',
      'sewing_assembly',
      'quality_control',
      'finishing',
      'dispatch',
      'delivered'
    ]

    const currentStageIndex = stages.indexOf(stage)
    const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : 'delivered'

    // Update work order
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set({
        currentStage: nextStage as any,
        updatedAt: new Date(),
        completedAt: nextStage === 'delivered' ? new Date() : null,
      })
      .where(eq(workOrders.id, workOrderId))
      .returning()

    // If not the last stage, automatically start the next stage
    if (nextStage !== 'delivered') {
      await db.insert(productionStageHistory).values({
        id: nanoid(),
        workOrderId,
        stage: nextStage as any,
        startedAt: new Date(),
        userId,
        notes: `Auto-started after completing ${stage.replace('_', ' ')}`,
      })
    }

    revalidatePath('/work-orders')
    revalidatePath(`/work-orders/${workOrderId}`)

    return {
      success: true,
      data: {
        stageHistory: updatedStageHistory,
        workOrder: updatedWorkOrder,
        duration,
        nextStage
      },
      message: `${stage.replace('_', ' ')} stage completed in ${Math.floor(duration / 60)}h ${duration % 60}m`
    }
  } catch (error) {
    console.error('Error finishing production stage:', error)
    return { success: false, error: 'Failed to finish production stage' }
  }
}

// Update work order stage (legacy function - kept for compatibility)
export async function updateWorkOrderStage(
  workOrderId: string,
  newStage: string,
  userId: string,
  notes?: string
) {
  try {
    // Get current work order
    const currentWorkOrder = await db.query.workOrders.findFirst({
      where: eq(workOrders.id, workOrderId)
    })

    if (!currentWorkOrder) {
      return { success: false, error: 'Work order not found' }
    }

    // Complete current stage
    await db
      .update(productionStageHistory)
      .set({
        completedAt: new Date(),
        duration: Math.floor((new Date().getTime() - new Date(currentWorkOrder.updatedAt).getTime()) / (1000 * 60)), // duration in minutes
        notes,
      })
      .where(
        and(
          eq(productionStageHistory.workOrderId, workOrderId),
          eq(productionStageHistory.stage, currentWorkOrder.currentStage)
        )
      )

    // Update work order current stage
    const [updatedWorkOrder] = await db
      .update(workOrders)
      .set({
        currentStage: newStage as any,
        updatedAt: new Date(),
        completedAt: newStage === 'delivered' ? new Date() : null,
      })
      .where(eq(workOrders.id, workOrderId))
      .returning()

    // Create new stage history
    await db.insert(productionStageHistory).values({
      id: nanoid(),
      workOrderId,
      stage: newStage as any,
      startedAt: new Date(),
      userId,
      notes,
    })

    revalidatePath('/work-orders')
    revalidatePath(`/work-orders/${workOrderId}`)

    return {
      success: true,
      data: updatedWorkOrder,
      message: `Work order updated to ${newStage.replace('_', ' ')} stage`
    }
  } catch (error) {
    console.error('Error updating work order stage:', error)
    return { success: false, error: 'Failed to update work order stage' }
  }
}

// Debug function to check sales orders and work orders
export async function debugSalesOrdersAndWorkOrders() {
  try {
    console.log('=== DEBUG: Checking each table separately ===')

    // Check sales orders table
    let allSalesOrders = []
    try {
      allSalesOrders = await db.select().from(salesOrders)
      console.log('All Sales Orders:', allSalesOrders)
    } catch (e) {
      console.error('Error fetching sales orders:', e)
      return { success: false, error: 'Failed to fetch sales orders', details: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Check approved sales orders
    let approvedSalesOrders = []
    try {
      approvedSalesOrders = await db
        .select()
        .from(salesOrders)
        .where(eq(salesOrders.status, 'approve'))
      console.log('Approved Sales Orders:', approvedSalesOrders)
    } catch (e) {
      console.error('Error fetching approved sales orders:', e)
      return { success: false, error: 'Failed to fetch approved sales orders', details: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Check sales order items
    let allSalesOrderItems = []
    try {
      allSalesOrderItems = await db.select().from(salesOrderItems)
      console.log('All Sales Order Items:', allSalesOrderItems)
    } catch (e) {
      console.error('Error fetching sales order items:', e)
      return { success: false, error: 'Failed to fetch sales order items', details: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Check work orders
    let allWorkOrders = []
    try {
      allWorkOrders = await db.select().from(workOrders)
      console.log('All Work Orders:', allWorkOrders)
    } catch (e) {
      console.error('Error fetching work orders:', e)
      return { success: false, error: 'Failed to fetch work orders', details: e instanceof Error ? e.message : 'Unknown error' }
    }

    // Check items for approved orders
    let itemsForApprovedOrders: any[] = []
    if (approvedSalesOrders.length > 0) {
      try {
        const approvedOrderIds = approvedSalesOrders.map(o => o.id)
        itemsForApprovedOrders = await db
          .select()
          .from(salesOrderItems)
          .where(sql`${salesOrderItems.salesOrderId} IN (${approvedOrderIds.join(',')})`)
        console.log('Items for approved orders:', itemsForApprovedOrders)
      } catch (e) {
        console.error('Error fetching items for approved orders:', e)
        return { success: false, error: 'Failed to fetch items for approved orders', details: e instanceof Error ? e.message : 'Unknown error' }
      }
    }

    return {
      success: true,
      data: {
        allSalesOrders,
        approvedSalesOrders,
        allSalesOrderItems,
        allWorkOrders,
        itemsForApprovedOrders
      }
    }
  } catch (error) {
    console.error('Debug error:', error)
    return { success: false, error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get approved sales orders that don't have work orders yet
export async function getApprovedSalesOrdersForWorkOrders() {
  try {
    console.log('=== Getting approved sales orders for work orders ===')

    // Step 1: Get approved sales orders
    const approvedOrders = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.status, 'approve'))

    console.log('Approved orders:', approvedOrders)

    if (!approvedOrders || approvedOrders.length === 0) {
      console.log('No approved sales orders found')
      return { success: true, data: [] }
    }

    // Step 2: Get all work orders to see which items are already used
    const existingWorkOrders = await db
      .select({
        salesOrderItemId: workOrders.salesOrderItemId,
      })
      .from(workOrders)

    console.log('Existing work orders:', existingWorkOrders)

    const usedItemIds = existingWorkOrders.map(wo => wo.salesOrderItemId)
    console.log('Used item IDs:', usedItemIds)

    // Step 3: Get all sales order items for approved orders that aren't used yet
    let availableItems = []

    if (usedItemIds.length > 0) {
      console.log('Filtering out used item IDs:', usedItemIds)

      // Use Drizzle's inArray method for approved order IDs
      const approvedOrderIds = approvedOrders.map(o => o.id)
      console.log('Approved order IDs:', approvedOrderIds)

      // First get all items from approved orders
      const allApprovedItems = await db
        .select()
        .from(salesOrderItems)
        .where(inArray(salesOrderItems.salesOrderId, approvedOrderIds))

      console.log('All approved order items:', allApprovedItems)

      // Then filter out used items in JavaScript
      availableItems = allApprovedItems.filter(item => !usedItemIds.includes(item.id))

      console.log('Items after filtering used ones:', availableItems)
    } else {
      // No work orders exist yet, get all items from approved orders
      console.log('No existing work orders, getting all items from approved orders')

      const approvedOrderIds = approvedOrders.map(o => o.id)
      console.log('Approved order IDs:', approvedOrderIds)

      availableItems = await db
        .select()
        .from(salesOrderItems)
        .where(inArray(salesOrderItems.salesOrderId, approvedOrderIds))
    }

    console.log('Available items:', availableItems)

    // Step 4: Get customer information and group by sales order
    const customerIds = [...new Set(approvedOrders.map(order => order.customerId))]
    const customerData = customerIds.length > 0 ? await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .where(inArray(customers.id, customerIds)) : []

    const customerMap = customerData.reduce((acc: Record<string, any>, customer) => {
      acc[customer.id] = customer.name
      return acc
    }, {})

    const groupedOrders = approvedOrders.map(order => {
      const orderItems = availableItems.filter(item => item.salesOrderId === order.id)
      console.log(`Order ${order.orderNumber} has ${orderItems.length} available items`)
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: customerMap[order.customerId] || 'Unknown Customer',
        customerId: order.customerId,
        orderDate: order.orderDate,
        targetDeliveryDate: order.targetDeliveryDate,
        items: orderItems
      }
    }).filter(order => order.items.length > 0) // Only include orders that have available items

    console.log('Grouped orders:', groupedOrders)

    return { success: true, data: groupedOrders }
  } catch (error) {
    console.error('Error fetching approved sales orders:', error)
    return { success: false, error: 'Failed to fetch approved sales orders', details: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Bulk create work orders from multiple sales order items
export async function createBulkWorkOrders(
  salesOrderItemIds: string[],
  createdBy: string,
  options: {
    priority?: number
    estimatedCompletion?: Date
    assignedTo?: string
  } = {}
) {
  try {
    console.log('=== Creating Bulk Work Orders ===')
    console.log('Sales order item IDs:', salesOrderItemIds)
    console.log('Created by:', createdBy)

    const results = []
    const errors = []

    for (const salesOrderItemId of salesOrderItemIds) {
      try {
        const result = await createWorkOrderFromSalesOrderItem(salesOrderItemId, createdBy, options)
        if (result.success) {
          results.push(result.data)
        } else {
          errors.push({ itemId: salesOrderItemId, error: result.error })
        }
      } catch (error) {
        errors.push({ itemId: salesOrderItemId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    console.log('Bulk creation results:', { results, errors })

    revalidatePath('/work-orders')

    return {
      success: results.length > 0,
      data: {
        created: results,
        errors,
        summary: {
          total: salesOrderItemIds.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Created ${results.length} of ${salesOrderItemIds.length} work orders successfully`
    }
  } catch (error) {
    console.error('Error creating bulk work orders:', error)
    return { success: false, error: 'Failed to create bulk work orders', details: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Get approved sales orders for work orders with search and filtering
export async function getApprovedSalesOrdersForWorkOrdersWithFilters(filters: {
  searchTerm?: string
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  urgentOnly?: boolean
  limit?: number
  offset?: number
} = {}) {
  try {
    console.log('=== Getting approved sales orders with filters ===')
    console.log('Filters:', filters)

    // Build all filter conditions
    const conditions = [eq(salesOrders.status, 'approve')]

    // Apply date filters
    if (filters.dateFrom) {
      conditions.push(sql`${salesOrders.orderDate} >= ${filters.dateFrom}`)
    }

    if (filters.dateTo) {
      conditions.push(sql`${salesOrders.orderDate} <= ${filters.dateTo}`)
    }

    // Apply customer filter
    if (filters.customerId) {
      conditions.push(eq(salesOrders.customerId, filters.customerId))
    }

    // Apply urgent filter (delivery within 7 days)
    if (filters.urgentOnly) {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      conditions.push(sql`${salesOrders.targetDeliveryDate} <= ${sevenDaysFromNow}`)
    }

    // Apply search term to sales orders
    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm}%`
      conditions.push(sql`(LOWER(${salesOrders.orderNumber}) LIKE LOWER(${searchTerm}) OR
             LOWER(${salesOrders.notes}) LIKE LOWER(${searchTerm}))`)
    }

    // Build the final query with all conditions
    let query = db
      .select()
      .from(salesOrders)
      .where(and(...conditions))

    // Apply pagination
    if (filters.limit) {
      query = (query as any).limit(filters.limit)
    }

    if (filters.offset) {
      query = (query as any).offset(filters.offset)
    }

    const approvedOrders = await query.orderBy(desc(salesOrders.orderDate))
    console.log('Filtered approved orders:', approvedOrders)

    if (!approvedOrders || approvedOrders.length === 0) {
      console.log('No approved sales orders found with filters')
      return { success: true, data: [], totalCount: 0 }
    }

    // Step 2: Get all work orders to see which items are already used
    const existingWorkOrders = await db
      .select({
        salesOrderItemId: workOrders.salesOrderItemId,
      })
      .from(workOrders)

    const usedItemIds = existingWorkOrders.map(wo => wo.salesOrderItemId)

    // Step 3: Get sales order items with additional filtering
    const approvedOrderIds = approvedOrders.map(o => o.id)

    // Build items query conditions
    const itemConditions = [inArray(salesOrderItems.salesOrderId, approvedOrderIds)]

    // Apply search term to items as well
    if (filters.searchTerm) {
      const searchTerm = `%${filters.searchTerm}%`
      itemConditions.push(sql`(LOWER(${salesOrderItems.productName}) LIKE LOWER(${searchTerm}) OR
               LOWER(${salesOrderItems.color}) LIKE LOWER(${searchTerm}) OR
               LOWER(${salesOrderItems.size}) LIKE LOWER(${searchTerm}))`)
    }

    const itemsQuery = db
      .select()
      .from(salesOrderItems)
      .where(and(...itemConditions))

    const allApprovedItems = await itemsQuery

    // Filter out used items
    const availableItems = allApprovedItems.filter(item => !usedItemIds.includes(item.id))

    // Step 4: Get customer information and group by sales order
    const customerIds = [...new Set(approvedOrders.map(order => order.customerId))]
    const customerData = customerIds.length > 0 ? await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .where(inArray(customers.id, customerIds)) : []

    const customerMap = customerData.reduce((acc: Record<string, any>, customer) => {
      acc[customer.id] = customer.name
      return acc
    }, {})

    const groupedOrders = approvedOrders.map(order => {
      const orderItems = availableItems.filter(item => item.salesOrderId === order.id)
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: customerMap[order.customerId] || 'Unknown Customer',
        customerId: order.customerId,
        orderDate: order.orderDate,
        targetDeliveryDate: order.targetDeliveryDate,
        notes: order.notes,
        items: orderItems,
        isUrgent: new Date(order.targetDeliveryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }).filter(order => order.items.length > 0)

    console.log('Grouped orders with filters:', groupedOrders)

    // Get total count for pagination (without filters for simplicity)
    const totalCountQuery = db
      .select({ count: sql`count(*)` })
      .from(salesOrders)
      .where(eq(salesOrders.status, 'approve'))

    const totalCountResult = await totalCountQuery
    const totalCount = Number(totalCountResult[0]?.count || 0)

    return {
      success: true,
      data: groupedOrders,
      totalCount,
      filters: {
        applied: Object.keys(filters).filter(key => filters[key as keyof typeof filters] !== undefined && filters[key as keyof typeof filters] !== ''),
        count: groupedOrders.length
      }
    }
  } catch (error) {
    console.error('Error fetching filtered approved sales orders:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    return {
      success: false,
      error: 'Failed to fetch filtered approved sales orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Delete work order
export async function deleteWorkOrder(id: string) {
  try {
    await db.delete(workOrders).where(eq(workOrders.id, id))
    revalidatePath('/work-orders')
    return { success: true, message: 'Work order deleted successfully' }
  } catch (error) {
    console.error('Error deleting work order:', error)
    return { success: false, error: 'Failed to delete work order' }
  }
}