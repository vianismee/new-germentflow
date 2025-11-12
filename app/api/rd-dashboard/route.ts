import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  sampleRequests,
  customers,
  sampleStatusHistory,
  sampleMaterialRequirements,
  sampleProcessStages
} from "@/db/schema";
import { eq, and, desc, ilike, count } from "drizzle-orm";

// GET /api/rd-dashboard - Get R&D dashboard data
export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");

    // Build query conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(sampleRequests.status, status as any));
    }

    if (customerId) {
      conditions.push(eq(sampleRequests.customerId, customerId));
    }

    if (search) {
      conditions.push(
        ilike(sampleRequests.sampleId, `%${search}%`)
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get sample requests with customer information for dashboard table
    const samples = await db
      .select({
        id: sampleRequests.id,
        sampleId: sampleRequests.sampleId,
        customerId: sampleRequests.customerId,
        sampleName: sampleRequests.sampleName,
        color: sampleRequests.color,
        status: sampleRequests.status,
        totalOrderQuantity: sampleRequests.totalOrderQuantity,
        createdAt: sampleRequests.createdAt,
        updatedAt: sampleRequests.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email
        }
      })
      .from(sampleRequests)
      .leftJoin(customers, eq(sampleRequests.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(sampleRequests.updatedAt));

    // Get status counts for dashboard overview
    const statusCounts = await db
      .select({
        status: sampleRequests.status,
        count: count(sampleRequests.id)
      })
      .from(sampleRequests)
      .groupBy(sampleRequests.status);

    // Get recent status changes
    const recentStatusChanges = await db
      .select({
        id: sampleStatusHistory.id,
        sampleRequestId: sampleStatusHistory.sampleRequestId,
        sampleId: sampleRequests.sampleId,
        sampleName: sampleRequests.sampleName,
        previousStatus: sampleStatusHistory.previousStatus,
        newStatus: sampleStatusHistory.newStatus,
        changedBy: sampleStatusHistory.changedBy,
        changeReason: sampleStatusHistory.changeReason,
        changedAt: sampleStatusHistory.changedAt,
        customer: {
          name: customers.name
        }
      })
      .from(sampleStatusHistory)
      .leftJoin(sampleRequests, eq(sampleStatusHistory.sampleRequestId, sampleRequests.id))
      .leftJoin(customers, eq(sampleRequests.customerId, customers.id))
      .orderBy(desc(sampleStatusHistory.changedAt))
      .limit(10);

    // Get material summary
    const materialSummary = await db
      .select({
        materialType: sampleMaterialRequirements.materialType,
        count: count(sampleMaterialRequirements.id)
      })
      .from(sampleMaterialRequirements)
      .groupBy(sampleMaterialRequirements.materialType)
      .orderBy(desc(count(sampleMaterialRequirements.id)))
      .limit(5);

    // Get process stage usage
    const processStageUsage = await db
      .select({
        processStage: sampleProcessStages.processStage,
        count: count(sampleProcessStages.id)
      })
      .from(sampleProcessStages)
      .groupBy(sampleProcessStages.processStage)
      .orderBy(desc(count(sampleProcessStages.id)));

    return NextResponse.json({
      data: {
        samples,
        overview: {
          statusCounts,
          totalSamples: samples.length,
          materialSummary,
          processStageUsage
        },
        recentActivity: recentStatusChanges
      }
    });

  } catch (error) {
    console.error("Error fetching R&D dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch R&D dashboard data" },
      { status: 500 }
    );
  }
}