import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  sampleRequests,
  sampleMaterialRequirements,
  sampleProcessStages,
  sampleStatusHistory,
  customers
} from "@/db/schema";
import { eq, and, desc, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/sample-requests - List all sample requests with filtering
export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

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

    // Get sample requests with customer information
    const samples = await db
      .select({
        id: sampleRequests.id,
        sampleId: sampleRequests.sampleId,
        customerId: sampleRequests.customerId,
        sampleName: sampleRequests.sampleName,
        color: sampleRequests.color,
        status: sampleRequests.status,
        totalOrderQuantity: sampleRequests.totalOrderQuantity,
        notes: sampleRequests.notes,
        createdBy: sampleRequests.createdBy,
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
      .orderBy(desc(sampleRequests.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sampleRequests.id })
      .from(sampleRequests)
      .where(whereClause);

    return NextResponse.json({
      data: samples,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching sample requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch sample requests" },
      { status: 500 }
    );
  }
}

// POST /api/sample-requests - Create a new sample request
export async function POST(request: NextRequest) {
  try {
    // For now, skip authentication to match other APIs in the project
    // TODO: Implement proper authentication when authentication system is fully set up
    const userId = "default-user"; // Temporary default user ID

    const body = await request.json();
    const {
      customerId,
      sampleName,
      color,
      totalOrderQuantity,
      notes,
      materialRequirements,
      processStages
    } = body;

    // Validate required fields
    if (!customerId || !sampleName) {
      return NextResponse.json(
        { error: "Customer ID and sample name are required" },
        { status: 400 }
      );
    }

    // Generate unique sample ID
    const sampleId = `SMP-${Date.now()}-${nanoid(6).toUpperCase()}`;

    // Create sample request
    const [newSample] = await db.insert(sampleRequests).values({
      id: nanoid(),
      sampleId,
      customerId,
      sampleName,
      color: color || null,
      totalOrderQuantity: totalOrderQuantity || null,
      notes: notes || null,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Add material requirements if provided
    if (materialRequirements && materialRequirements.length > 0) {
      const materialData = materialRequirements.map((req: any) => ({
        id: nanoid(),
        sampleRequestId: newSample.id,
        materialType: req.materialType,
        quantity: "0", // Default value since field is required in DB
        unit: "pieces", // Default unit since field is required in DB
        specifications: req.specifications || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(sampleMaterialRequirements).values(materialData);
    }

    // Add process stages if provided
    if (processStages && processStages.length > 0) {
      const processData = processStages.map((stage: any, index: number) => ({
        id: nanoid(),
        sampleRequestId: newSample.id,
        processStage: stage.processStage,
        sequence: stage.sequence || index + 1,
        createdAt: new Date()
      }));

      await db.insert(sampleProcessStages).values(processData);
    }

    // Create initial status history entry
    await db.insert(sampleStatusHistory).values({
      id: nanoid(),
      sampleRequestId: newSample.id,
      previousStatus: null,
      newStatus: "draft",
      changedBy: userId,
      changeReason: "Sample request created",
      changedAt: new Date()
    });

    return NextResponse.json({
      message: "Sample request created successfully",
      data: newSample
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating sample request:", error);
    return NextResponse.json(
      { error: "Failed to create sample request" },
      { status: 500 }
    );
  }
}