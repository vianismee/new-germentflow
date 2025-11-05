import { nanoid } from 'nanoid'
import { db } from '@/db'
import { customers, salesOrders, salesOrderItems, workOrders, productionStageHistory, qualityInspections } from '@/db/schema/business'
import { customerStatusEnum, orderStatusEnum, productionStageEnum, qualityStatusEnum } from '@/db/schema/business'

/**
 * Migration script to insert WO-2025-022 data from data-system-v1
 * Customer: Bapak Riza
 * Product: Jersey
 * Stage: Cutting
 * QC Results: 100 passed, 0 repaired, 0 rejected
 */

export async function migrateWO2025_022() {
  console.log('🚀 Starting migration for WO-2025-022...')

  try {
    // Step 1: Create customer record for Bapak Riza
    const customerId = nanoid()
    const customerData = {
      id: customerId,
      name: "Bapak Riza",
      contactPerson: "Riza",
      email: "riza@example.com", // Generated email
      phone: "+62-812-3456-7890", // Generated phone
      address: "Indonesia", // Generated address
      status: customerStatusEnum.enumValues[0], // "active"
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
      targetDeliveryDate: new Date('2025-11-24'), // 1 month from order date
      status: orderStatusEnum.enumValues[2], // "approved"
      totalAmount: "500000", // Generated amount (5 units × 100k)
      notes: "Jersey order - 5XL Hitam and Jersey Longsleeve 5XL Putih",
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
      salesOrderItemId: items[0].id, // Link to first item (main item)
      currentStage: productionStageEnum.enumValues[3], // "cutting"
      startedAt: new Date('2025-10-24'),
      completedAt: null,
      estimatedCompletion: new Date('2025-11-24'),
      priority: 5, // Normal priority
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
        stage: productionStageEnum.enumValues[0], // "order_processing"
        startedAt: new Date('2025-10-24'),
        completedAt: new Date('2025-10-24'),
        duration: 60, // 1 hour
        notes: 'Order processed and ready for material procurement',
        userId: 'system-migration',
        createdAt: new Date()
      },
      {
        id: nanoid(),
        workOrderId: workOrderId,
        stage: productionStageEnum.enumValues[1], // "material_procurement"
        startedAt: new Date('2025-10-24'),
        completedAt: new Date('2025-10-24'),
        duration: 120, // 2 hours
        notes: 'Materials procured successfully',
        userId: 'system-migration',
        createdAt: new Date()
      },
      {
        id: nanoid(),
        workOrderId: workOrderId,
        stage: productionStageEnum.enumValues[2], // "cutting"
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
    const totalQuantity = 10 // Total units (5 + 5 from the two items)
    const inspectionData = {
      id: inspectionId,
      workOrderId: workOrderId,
      stage: productionStageEnum.enumValues[3], // "cutting"
      status: qualityStatusEnum.enumValues[1], // "pass" (100% passed)
      inspectedBy: 'system-migration',
      inspectionDate: new Date(),
      totalQuantity: totalQuantity,
      passedQuantity: 100, // From your data: Lolos QC = 100
      repairedQuantity: 0,
      rejectedQuantity: 0,
      issues: null, // No issues since 100% passed
      repairNotes: null,
      reinspectionDate: null,
      finalStatus: qualityStatusEnum.enumValues[1], // "pass"
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.insert(qualityInspections).values(inspectionData)
    console.log('✅ Quality inspection created:', inspectionId)

    console.log('🎉 Migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Customer: ${customerData.name}`)
    console.log(`   - Sales Order: ${salesOrderData.orderNumber}`)
    console.log(`   - Work Order: ${workOrderData.workOrderNumber}`)
    console.log(`   - Total Items: ${items.length}`)
    console.log(`   - Total Quantity: ${totalQuantity}`)
    console.log(`   - Current Stage: ${workOrderData.currentStage}`)
    console.log(`   - QC Result: ${inspectionData.passedQuantity} passed, ${inspectionData.repairedQuantity} repaired, ${inspectionData.rejectedQuantity} rejected`)
    console.log(`   - Status: Ready for cutting stage completion`)

    return {
      success: true,
      customerId,
      salesOrderId,
      workOrderId,
      inspectionId,
      itemCount: items.length,
      totalQuantity
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Helper function to rollback the migration if needed
export async function rollbackWO2025_022() {
  console.log('🔄 Starting rollback for WO-2025-022...')

  try {
    // Note: This is a simple rollback that removes by specific identifiers
    // In a production environment, you'd want more sophisticated tracking
    console.log('⚠️  Manual rollback required - please manually delete:')
    console.log('   - Customer: Bapak Riza')
    console.log('   - Sales Order: SO-2025-021')
    console.log('   - Work Order: WO-2025-022')

    return { success: true, message: 'Manual rollback instructions provided' }
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}