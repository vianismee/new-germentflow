import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '@/db'
import { customers, salesOrders, salesOrderItems, workOrders, productionStageHistory, qualityInspections } from '@/db/schema/business'

/**
 * API endpoint to migrate WO-2025-022 data
 * POST /api/migrate
 */

export async function POST() {
  console.log('🚀 Starting migration for WO-2025-022...')

  try {
    // Step 1: Create customer record for Bapak Riza
    const customerId = nanoid()
    const customerData = {
      id: customerId,
      name: "Bapak Riza",
      contactPerson: "Riza",
      email: "riza@example.com",
      phone: "+62-812-3456-7890",
      address: "Indonesia",
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(customers).values(customerData)
    console.log('✅ Customer created:', customerData.name)

    // Step 2: Create sales order record for SO-2025-021
    const salesOrderId = nanoid()
    const salesOrderData = {
      id: salesOrderId,
      orderNumber: 'SO-2025-021',
      customerId: customerId,
      orderDate: new Date('2025-10-24'),
      targetDeliveryDate: new Date('2025-11-24'),
      status: 'approve' as const,
      totalAmount: "1100000", // (5×100k) + (5×120k) = 500k + 600k
      notes: 'Jersey order - 5XL Hitam and Jersey Longsleeve 5XL Putih',
      createdBy: 'system-migration',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(salesOrders).values(salesOrderData)
    console.log('✅ Sales order created:', salesOrderData.orderNumber)

    // Step 3: Create sales order items
    const items = [
      {
        id: nanoid(),
        salesOrderId: salesOrderId,
        productName: 'Jersey',
        quantity: 5,
        size: '5XL',
        color: 'Hitam',
        unitPrice: "100000",
        totalPrice: "500000",
        specifications: JSON.stringify({
          type: 'Regular Jersey',
          material: 'Cotton Blend',
          design: 'Standard'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: nanoid(),
        salesOrderId: salesOrderId,
        productName: 'Jersey Longsleeve',
        quantity: 5,
        size: '5XL',
        color: 'Putih',
        unitPrice: "120000",
        totalPrice: "600000",
        specifications: JSON.stringify({
          type: 'Long Sleeve Jersey',
          material: 'Cotton Blend',
          design: 'Standard'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    for (const item of items) {
      await db.insert(salesOrderItems).values(item)
      console.log(`✅ Sales order item created: ${item.productName} - ${item.color}`)
    }

    // Step 4: Create work order record for WO-2025-022
    const workOrderId = nanoid()
    const workOrderData = {
      id: workOrderId,
      workOrderNumber: 'WO-2025-022',
      salesOrderId: salesOrderId,
      salesOrderItemId: items[0].id,
      currentStage: 'cutting' as const,
      startedAt: new Date('2025-10-24'),
      completedAt: null,
      estimatedCompletion: new Date('2025-11-24'),
      priority: 5,
      assignedTo: null,
      createdBy: 'system-migration',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(workOrders).values(workOrderData)
    console.log('✅ Work order created:', workOrderData.workOrderNumber)

    // Step 5: Create production stage history
    const stageHistory = [
      {
        id: nanoid(),
        workOrderId: workOrderId,
        stage: 'order_processing' as const,
        startedAt: new Date('2025-10-24'),
        completedAt: new Date('2025-10-24'),
        duration: 60,
        notes: 'Order processed and ready for material procurement',
        userId: 'system-migration',
        createdAt: new Date()
      },
      {
        id: nanoid(),
        workOrderId: workOrderId,
        stage: 'material_procurement' as const,
        startedAt: new Date('2025-10-24'),
        completedAt: new Date('2025-10-24'),
        duration: 120,
        notes: 'Materials procured successfully',
        userId: 'system-migration',
        createdAt: new Date()
      },
      {
        id: nanoid(),
        workOrderId: workOrderId,
        stage: 'cutting' as const,
        startedAt: new Date('2025-10-24'),
        completedAt: null,
        duration: null,
        notes: 'Currently in cutting stage - 100 items passed QC',
        userId: 'system-migration',
        createdAt: new Date()
      }
    ]

    for (const stage of stageHistory) {
      await db.insert(productionStageHistory).values(stage)
      console.log(`✅ Stage history created: ${stage.stage}`)
    }

    // Step 6: Create quality control inspection record
    const inspectionId = nanoid()
    const totalQuantity = 10
    const inspectionData = {
      id: inspectionId,
      workOrderId: workOrderId,
      stage: 'cutting' as const,
      status: 'pass' as const,
      inspectedBy: 'system-migration',
      inspectionDate: new Date(),
      totalQuantity: totalQuantity,
      passedQuantity: 100,
      repairedQuantity: 0,
      rejectedQuantity: 0,
      issues: null,
      repairNotes: null,
      reinspectionDate: null,
      finalStatus: 'pass' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(qualityInspections).values(inspectionData)
    console.log('✅ Quality inspection created:', inspectionId)

    const result = {
      success: true,
      message: 'WO-2025-022 migration completed successfully!',
      data: {
        customerId,
        salesOrderId,
        workOrderId,
        inspectionId,
        itemCount: items.length,
        totalQuantity,
        summary: {
          customer: customerData.name,
          salesOrder: salesOrderData.orderNumber,
          workOrder: workOrderData.workOrderNumber,
          currentStage: workOrderData.currentStage,
          qcResult: `${inspectionData.passedQuantity} passed, ${inspectionData.repairedQuantity} repaired, ${inspectionData.rejectedQuantity} rejected`
        }
      }
    }

    console.log('🎉 Migration completed successfully!')
    console.log('📊 Summary:', result.data.summary)

    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}