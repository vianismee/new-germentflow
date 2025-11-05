"use server"

import {
  qualityInspections,
  workOrders,
  productionStageHistory,
  userRoles,
  salesOrderItems,
  salesOrders,
  customers
} from "@/db/schema"
import { db } from "@/db"
import { eq, and, desc, asc, isNull, not, sql } from "drizzle-orm"
import { nanoid } from "nanoid"

export type QualityInspection = {
  id: string
  workOrderId: string
  stage: string
  status: "pending" | "pass" | "repair" | "reject"
  inspectedBy: string
  inspectionDate: Date
  totalQuantity: number
  passedQuantity: number
  repairedQuantity: number
  rejectedQuantity: number
  issues?: QualityIssue[]
  repairNotes?: string
  reinspectionDate?: Date | null
  finalStatus?: "pending" | "pass" | "repair" | "reject"
  createdAt: Date
  updatedAt: Date
  workOrderNumber?: string
  productName?: string
  quantity?: number
  customerName?: string
  inspectorName?: string
}

export type QualityMetrics = {
  totalInspections: number
  totalUnitsInspected: number
  totalUnitsPassed: number
  totalUnitsRepaired: number
  totalUnitsRejected: number
  passedInspections: number
  repairedInspections: number
  rejectedInspections: number
  pendingInspections: number
  passRate: number
  repairRate: number
  rejectRate: number
  unitPassRate: number
  unitRepairRate: number
  unitRejectRate: number
  averageInspectionTime: number
  inspectionsByStage: Record<string, number>
  inspectionsByInspector: Record<string, number>
}

export type QualityIssue = {
  id: string
  type: string
  description: string
  severity: "minor" | "major" | "critical"
  position?: string
  quantity?: number
  category: "repair" | "reject"
}

export type InspectionFormData = {
  workOrderId: string
  stage: string
  status: "pass" | "repair" | "reject"
  totalQuantity: number
  passedQuantity: number
  repairedQuantity: number
  rejectedQuantity: number
  issues: QualityIssue[]
  repairNotes?: string
  reinspectionRequired?: boolean
  reinspectionDate?: Date
  inspectorNotes?: string
}

// Get quality inspections with filtering and pagination
export async function getQualityInspections(params: {
  page?: number
  limit?: number
  status?: string
  stage?: string
  inspectorId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      stage,
      inspectorId,
      dateFrom,
      dateTo,
      search
    } = params

    const offset = (page - 1) * limit

    // Apply filters
    const conditions = []

    if (status) {
      conditions.push(eq(qualityInspections.status, status as any))
    }

    if (stage) {
      conditions.push(eq(qualityInspections.stage, stage as any))
    }

    if (inspectorId) {
      conditions.push(eq(qualityInspections.inspectedBy, inspectorId))
    }

    if (dateFrom) {
      conditions.push(sql`${qualityInspections.inspectionDate} >= ${dateFrom}`)
    }

    if (dateTo) {
      conditions.push(sql`${qualityInspections.inspectionDate} <= ${dateTo}`)
    }

    if (search) {
      conditions.push(
        sql`(
          ${workOrders.workOrderNumber} ILIKE ${'%' + search + '%'} OR
          ${salesOrderItems.productName} ILIKE ${'%' + search + '%'} OR
          ${customers.name} ILIKE ${'%' + search + '%'}
        )`
      )
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build the base query
    const query = db
      .select({
        id: qualityInspections.id,
        workOrderId: qualityInspections.workOrderId,
        stage: qualityInspections.stage,
        status: qualityInspections.status,
        inspectedBy: qualityInspections.inspectedBy,
        inspectionDate: qualityInspections.inspectionDate,
        totalQuantity: qualityInspections.totalQuantity,
        passedQuantity: qualityInspections.passedQuantity,
        repairedQuantity: qualityInspections.repairedQuantity,
        rejectedQuantity: qualityInspections.rejectedQuantity,
        issues: qualityInspections.issues,
        repairNotes: qualityInspections.repairNotes,
        reinspectionDate: qualityInspections.reinspectionDate,
        finalStatus: qualityInspections.finalStatus,
        createdAt: qualityInspections.createdAt,
        updatedAt: qualityInspections.updatedAt,
        workOrderNumber: workOrders.workOrderNumber,
        productName: salesOrderItems.productName,
        quantity: salesOrderItems.quantity,
        customerName: customers.name,
      })
      .from(qualityInspections)
      .leftJoin(workOrders, eq(qualityInspections.workOrderId, workOrders.id))
      .leftJoin(salesOrderItems, eq(workOrders.salesOrderItemId, salesOrderItems.id))
      .leftJoin(salesOrders, eq(workOrders.salesOrderId, salesOrders.id))
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(whereClause)

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(qualityInspections)
      .where(whereClause)

    const data = await query.orderBy(desc(qualityInspections.inspectionDate)).limit(limit).offset(offset)

    const total = totalResult[0]?.count || 0

    // Parse issues JSON if present
    const processedData = data.map(item => ({
      ...item,
      issues: item.issues ? JSON.parse(item.issues) : undefined
    }))

    return {
      success: true,
      data: processedData as QualityInspection[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error("Failed to fetch quality inspections:", error)
    return {
      success: false,
      error: "Failed to fetch quality inspections"
    }
  }
}

// Get quality inspection by ID
export async function getQualityInspectionById(id: string) {
  try {
    const result = await db
      .select({
        id: qualityInspections.id,
        workOrderId: qualityInspections.workOrderId,
        stage: qualityInspections.stage,
        status: qualityInspections.status,
        inspectedBy: qualityInspections.inspectedBy,
        inspectionDate: qualityInspections.inspectionDate,
        totalQuantity: qualityInspections.totalQuantity,
        passedQuantity: qualityInspections.passedQuantity,
        repairedQuantity: qualityInspections.repairedQuantity,
        rejectedQuantity: qualityInspections.rejectedQuantity,
        issues: qualityInspections.issues,
        repairNotes: qualityInspections.repairNotes,
        reinspectionDate: qualityInspections.reinspectionDate,
        finalStatus: qualityInspections.finalStatus,
        createdAt: qualityInspections.createdAt,
        updatedAt: qualityInspections.updatedAt,
        workOrderNumber: workOrders.workOrderNumber,
        productName: salesOrderItems.productName,
        quantity: salesOrderItems.quantity,
        customerName: customers.name,
      })
      .from(qualityInspections)
      .leftJoin(workOrders, eq(qualityInspections.workOrderId, workOrders.id))
      .leftJoin(salesOrderItems, eq(workOrders.salesOrderItemId, salesOrderItems.id))
      .leftJoin(salesOrders, eq(workOrders.salesOrderId, salesOrders.id))
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(eq(qualityInspections.id, id))
      .limit(1)

    const inspection = result[0]

    if (!inspection) {
      return {
        success: false,
        error: "Quality inspection not found"
      }
    }

    // Parse issues JSON if present
    const processedInspection = {
      ...inspection,
      issues: inspection.issues ? JSON.parse(inspection.issues) : undefined
    }

    return {
      success: true,
      data: processedInspection as QualityInspection
    }
  } catch (error) {
    console.error("Failed to fetch quality inspection:", error)
    return {
      success: false,
      error: "Failed to fetch quality inspection"
    }
  }
}

// Create or update quality inspection
export async function createQualityInspection(data: InspectionFormData, inspectorId: string) {
  try {
    const id = nanoid()
    const now = new Date()

    const inspectionData = {
      id,
      workOrderId: data.workOrderId,
      stage: data.stage as any,
      status: data.status as any,
      inspectedBy: inspectorId,
      inspectionDate: now,
      totalQuantity: data.totalQuantity,
      passedQuantity: data.passedQuantity,
      repairedQuantity: data.repairedQuantity,
      rejectedQuantity: data.rejectedQuantity,
      issues: data.issues && data.issues.length > 0 ? JSON.stringify(data.issues) : null,
      repairNotes: data.repairNotes || null,
      reinspectionDate: data.reinspectionRequired ? data.reinspectionDate : null,
      finalStatus: data.status === "pass" ? "pass" : data.status as any,
      createdAt: now,
      updatedAt: now
    }

    await db.insert(qualityInspections).values(inspectionData)

    // Update work order stage if all units pass quality control or if any units need to proceed
    if (data.stage === "quality_control") {
      // Determine if we should advance to finishing based on inspection results
      const hasPassedUnits = data.passedQuantity > 0
      const hasIssues = data.repairedQuantity > 0 || data.rejectedQuantity > 0

      // Advance to finishing if there are passed units or if it's a mixed result
      if (hasPassedUnits || (data.repairedQuantity > 0 && data.rejectedQuantity === 0)) {
        await db
          .update(workOrders)
          .set({
            currentStage: "finishing",
            updatedAt: now
          })
          .where(eq(workOrders.id, data.workOrderId))

        // Add to production stage history
        await db.insert(productionStageHistory).values({
          id: nanoid(),
          workOrderId: data.workOrderId,
          stage: "quality_control",
          startedAt: now,
          completedAt: now,
          duration: 0, // Quality control inspection time
          notes: `Quality control completed: ${data.passedQuantity} passed, ${data.repairedQuantity} repaired, ${data.rejectedQuantity} rejected. Inspector: ${inspectorId}`,
          userId: inspectorId,
          createdAt: now
        })

        await db.insert(productionStageHistory).values({
          id: nanoid(),
          workOrderId: data.workOrderId,
          stage: "finishing",
          startedAt: now,
          userId: inspectorId,
          createdAt: now
        })
      }
    }

    return {
      success: true,
      message: `Quality inspection ${data.status === "pass" ? "passed" : data.status === "repair" ? "requires repair" : "rejected"} successfully`,
      data: { id }
    }
  } catch (error) {
    console.error("Failed to create quality inspection:", error)
    return {
      success: false,
      error: "Failed to create quality inspection"
    }
  }
}

// Update quality inspection
export async function updateQualityInspection(id: string, data: Partial<InspectionFormData>) {
  try {
    const now = new Date()
    const updateData: any = {
      updatedAt: now
    }

    if (data.status) {
      updateData.status = data.status
      updateData.finalStatus = data.status
    }

    if (data.issues) {
      updateData.issues = JSON.stringify(data.issues)
    }

    if (data.repairNotes !== undefined) {
      updateData.repairNotes = data.repairNotes
    }

    if (data.reinspectionDate) {
      updateData.reinspectionDate = data.reinspectionDate
    }

    await db
      .update(qualityInspections)
      .set(updateData)
      .where(eq(qualityInspections.id, id))

    return {
      success: true,
      message: "Quality inspection updated successfully"
    }
  } catch (error) {
    console.error("Failed to update quality inspection:", error)
    return {
      success: false,
      error: "Failed to update quality inspection"
    }
  }
}

// Delete quality inspection
export async function deleteQualityInspection(id: string) {
  try {
    await db.delete(qualityInspections).where(eq(qualityInspections.id, id))

    return {
      success: true,
      message: "Quality inspection deleted successfully"
    }
  } catch (error) {
    console.error("Failed to delete quality inspection:", error)
    return {
      success: false,
      error: "Failed to delete quality inspection"
    }
  }
}

// Get quality metrics
export async function getQualityMetrics(params?: {
  dateFrom?: Date
  dateTo?: Date
  inspectorId?: string
}): Promise<{ success: boolean; data?: QualityMetrics; error?: string }> {
  try {
    const { dateFrom, dateTo, inspectorId } = params || {}

    // Build conditions
    const conditions = []

    if (dateFrom) {
      conditions.push(sql`${qualityInspections.inspectionDate} >= ${dateFrom}`)
    }

    if (dateTo) {
      conditions.push(sql`${qualityInspections.inspectionDate} <= ${dateTo}`)
    }

    if (inspectorId) {
      conditions.push(eq(qualityInspections.inspectedBy, inspectorId))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Get basic counts and unit quantities
    const [statusCounts, stageCounts, inspectorCounts, quantityTotals] = await Promise.all([
      db
        .select({
          status: qualityInspections.status,
          count: sql<number>`count(*)`
        })
        .from(qualityInspections)
        .where(whereClause)
        .groupBy(qualityInspections.status),

      db
        .select({
          stage: qualityInspections.stage,
          count: sql<number>`count(*)`
        })
        .from(qualityInspections)
        .where(whereClause)
        .groupBy(qualityInspections.stage),

      db
        .select({
          inspector: qualityInspections.inspectedBy,
          count: sql<number>`count(*)`
        })
        .from(qualityInspections)
        .where(whereClause)
        .groupBy(qualityInspections.inspectedBy),

      db
        .select({
          totalUnits: sql<number>`SUM(${qualityInspections.totalQuantity})`,
          passedUnits: sql<number>`SUM(${qualityInspections.passedQuantity})`,
          repairedUnits: sql<number>`SUM(${qualityInspections.repairedQuantity})`,
          rejectedUnits: sql<number>`SUM(${qualityInspections.rejectedQuantity})`
        })
        .from(qualityInspections)
        .where(whereClause)
        .limit(1)
    ])

    // Calculate metrics
    const totalInspections = statusCounts.reduce((sum, item) => sum + item.count, 0)
    const passedInspections = statusCounts.find(item => item.status === 'pass')?.count || 0
    const repairedInspections = statusCounts.find(item => item.status === 'repair')?.count || 0
    const rejectedInspections = statusCounts.find(item => item.status === 'reject')?.count || 0
    const pendingInspections = statusCounts.find(item => item.status === 'pending')?.count || 0

    const passRate = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0
    const repairRate = totalInspections > 0 ? (repairedInspections / totalInspections) * 100 : 0
    const rejectRate = totalInspections > 0 ? (rejectedInspections / totalInspections) * 100 : 0

    // Calculate unit-level metrics
    const totalUnitsInspected = quantityTotals[0]?.totalUnits || 0
    const totalUnitsPassed = quantityTotals[0]?.passedUnits || 0
    const totalUnitsRepaired = quantityTotals[0]?.repairedUnits || 0
    const totalUnitsRejected = quantityTotals[0]?.rejectedUnits || 0

    const unitPassRate = totalUnitsInspected > 0 ? (totalUnitsPassed / totalUnitsInspected) * 100 : 0
    const unitRepairRate = totalUnitsInspected > 0 ? (totalUnitsRepaired / totalUnitsInspected) * 100 : 0
    const unitRejectRate = totalUnitsInspected > 0 ? (totalUnitsRejected / totalUnitsInspected) * 100 : 0

    // Calculate average inspection time (from production stage history)
    const avgTimeResult = await db
      .select({
        avgDuration: sql<number>`AVG(${productionStageHistory.duration})`
      })
      .from(productionStageHistory)
      .where(and(
        eq(productionStageHistory.stage, 'quality_control'),
        not(isNull(productionStageHistory.duration))
      ))
      .limit(1)

    const averageInspectionTime = avgTimeResult[0]?.avgDuration || 0

    // Transform data to expected format
    const inspectionsByStage = stageCounts.reduce((acc, item) => {
      acc[item.stage] = item.count
      return acc
    }, {} as Record<string, number>)

    const inspectionsByInspector = inspectorCounts.reduce((acc, item) => {
      acc[item.inspector] = item.count
      return acc
    }, {} as Record<string, number>)

    const metrics: QualityMetrics = {
      totalInspections,
      totalUnitsInspected,
      totalUnitsPassed,
      totalUnitsRepaired,
      totalUnitsRejected,
      passedInspections,
      repairedInspections,
      rejectedInspections,
      pendingInspections,
      passRate,
      repairRate,
      rejectRate,
      unitPassRate,
      unitRepairRate,
      unitRejectRate,
      averageInspectionTime,
      inspectionsByStage,
      inspectionsByInspector
    }

    return {
      success: true,
      data: metrics
    }
  } catch (error) {
    console.error("Failed to fetch quality metrics:", error)
    return {
      success: false,
      error: "Failed to fetch quality metrics"
    }
  }
}

// Get specific work order by ID for quality control inspection
export async function getWorkOrderById(workOrderId: string) {
  try {
    const result = await db
      .select({
        id: workOrders.id,
        workOrderNumber: workOrders.workOrderNumber,
        currentStage: workOrders.currentStage,
        priority: workOrders.priority,
        salesOrderId: workOrders.salesOrderId,
        salesOrderItemId: workOrders.salesOrderItemId,
        productName: salesOrderItems.productName,
        quantity: salesOrderItems.quantity,
        customerName: customers.name,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
        inspectionId: qualityInspections.id,
        inspectionStatus: qualityInspections.status,
      })
      .from(workOrders)
      .leftJoin(salesOrderItems, eq(workOrders.salesOrderItemId, salesOrderItems.id))
      .leftJoin(salesOrders, eq(workOrders.salesOrderId, salesOrders.id))
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(qualityInspections, eq(workOrders.id, qualityInspections.workOrderId))
      .where(eq(workOrders.id, workOrderId))
      .limit(1)

    if (result.length === 0) {
      return {
        success: false,
        error: "Work order not found"
      }
    }

    return {
      success: true,
      data: result[0]
    }
  } catch (error) {
    console.error("Failed to fetch work order:", error)
    return {
      success: false,
      error: "Failed to fetch work order"
    }
  }
}

// Get work orders ready for quality control inspection
export async function getWorkOrdersForQualityControl() {
  try {
    const result = await db
      .select({
        id: workOrders.id,
        workOrderNumber: workOrders.workOrderNumber,
        currentStage: workOrders.currentStage,
        priority: workOrders.priority,
        salesOrderId: workOrders.salesOrderId,
        salesOrderItemId: workOrders.salesOrderItemId,
        productName: salesOrderItems.productName,
        quantity: salesOrderItems.quantity,
        customerName: customers.name,
        createdAt: workOrders.createdAt,
        updatedAt: workOrders.updatedAt,
        inspectionId: qualityInspections.id,
        inspectionStatus: qualityInspections.status,
      })
      .from(workOrders)
      .leftJoin(salesOrderItems, eq(workOrders.salesOrderItemId, salesOrderItems.id))
      .leftJoin(salesOrders, eq(workOrders.salesOrderId, salesOrders.id))
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(qualityInspections, eq(workOrders.id, qualityInspections.workOrderId))
      .where(eq(workOrders.currentStage, "quality_control"))
      .orderBy(asc(workOrders.priority), asc(workOrders.createdAt))

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error("Failed to fetch work orders for quality control:", error)
    return {
      success: false,
      error: "Failed to fetch work orders for quality control"
    }
  }
}

// Get quality inspectors (users with quality-inspector role)
export async function getQualityInspectors() {
  try {
    const result = await db
      .select({
        userId: userRoles.userId,
        role: userRoles.role,
        isActive: userRoles.isActive
      })
      .from(userRoles)
      .where(and(
        eq(userRoles.role, "quality-inspector"),
        eq(userRoles.isActive, true)
      ))

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error("Failed to fetch quality inspectors:", error)
    return {
      success: false,
      error: "Failed to fetch quality inspectors"
    }
  }
}