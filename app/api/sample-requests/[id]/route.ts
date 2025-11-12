import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  sampleRequests,
  sampleMaterialRequirements,
  sampleProcessStages,
  sampleStatusHistory,
  customers
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase/client";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/sample-requests/[id] - Get a specific sample request with all details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get sample request with customer information
    const [sample] = await db
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
          email: customers.email,
          phone: customers.phone
        }
      })
      .from(sampleRequests)
      .leftJoin(customers, eq(sampleRequests.customerId, customers.id))
      .where(eq(sampleRequests.id, id));

    if (!sample) {
      return NextResponse.json(
        { error: "Sample request not found" },
        { status: 404 }
      );
    }

    // Get material requirements
    const materialRequirements = await db
      .select()
      .from(sampleMaterialRequirements)
      .where(eq(sampleMaterialRequirements.sampleRequestId, id))
      .orderBy(sampleMaterialRequirements.createdAt);

    // Get process stages
    const processStages = await db
      .select()
      .from(sampleProcessStages)
      .where(eq(sampleProcessStages.sampleRequestId, id))
      .orderBy(sampleProcessStages.sequence);

    // Get status history
    const statusHistory = await db
      .select()
      .from(sampleStatusHistory)
      .where(eq(sampleStatusHistory.sampleRequestId, id))
      .orderBy(desc(sampleStatusHistory.changedAt));

    return NextResponse.json({
      data: {
        ...sample,
        materialRequirements,
        processStages,
        statusHistory
      }
    });

  } catch (error) {
    console.error("Error fetching sample request:", error);
    return NextResponse.json(
      { error: "Failed to fetch sample request" },
      { status: 500 }
    );
  }
}

// PUT /api/sample-requests/[id] - Update a sample request
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      sampleName,
      color,
      totalOrderQuantity,
      notes,
      materialRequirements,
      processStages
    } = body;

    // Check if sample request exists and is in draft status
    const [existingSample] = await db
      .select()
      .from(sampleRequests)
      .where(eq(sampleRequests.id, id));

    if (!existingSample) {
      return NextResponse.json(
        { error: "Sample request not found" },
        { status: 404 }
      );
    }

    if (existingSample.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft sample requests can be edited" },
        { status: 400 }
      );
    }

    // Update sample request
    const [updatedSample] = await db
      .update(sampleRequests)
      .set({
        sampleName: sampleName || existingSample.sampleName,
        color: color !== undefined ? color : existingSample.color,
        totalOrderQuantity: totalOrderQuantity !== undefined ? totalOrderQuantity : existingSample.totalOrderQuantity,
        notes: notes !== undefined ? notes : existingSample.notes,
        updatedAt: new Date()
      })
      .where(eq(sampleRequests.id, id))
      .returning();

    // Update material requirements if provided
    if (materialRequirements !== undefined) {
      // Delete existing material requirements
      await db
        .delete(sampleMaterialRequirements)
        .where(eq(sampleMaterialRequirements.sampleRequestId, id));

      // Add new material requirements
      if (materialRequirements.length > 0) {
        const materialData = materialRequirements.map((req: any) => ({
          id: nanoid(),
          sampleRequestId: id,
          materialType: req.materialType,
          quantity: req.quantity,
          unit: req.unit,
          specifications: req.specifications || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await db.insert(sampleMaterialRequirements).values(materialData);
      }
    }

    // Update process stages if provided
    if (processStages !== undefined) {
      // Delete existing process stages
      await db
        .delete(sampleProcessStages)
        .where(eq(sampleProcessStages.sampleRequestId, id));

      // Add new process stages
      if (processStages.length > 0) {
        const processData = processStages.map((stage: any, index: number) => ({
          id: nanoid(),
          sampleRequestId: id,
          processStage: stage.processStage,
          sequence: stage.sequence || index + 1,
          createdAt: new Date()
        }));

        await db.insert(sampleProcessStages).values(processData);
      }
    }

    return NextResponse.json({
      message: "Sample request updated successfully",
      data: updatedSample
    });

  } catch (error) {
    console.error("Error updating sample request:", error);
    return NextResponse.json(
      { error: "Failed to update sample request" },
      { status: 500 }
    );
  }
}

// DELETE /api/sample-requests/[id] - Delete a sample request
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // For now, skip authentication to match other APIs in the project
    const userId = "default-user"; // Temporary default user ID

    // Check if sample request exists and is in draft status
    const [existingSample] = await db
      .select()
      .from(sampleRequests)
      .where(eq(sampleRequests.id, id));

    if (!existingSample) {
      return NextResponse.json(
        { error: "Sample request not found" },
        { status: 404 }
      );
    }

    if (existingSample.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft sample requests can be deleted" },
        { status: 400 }
      );
    }

    // Delete sample request (cascade will delete related records)
    await db.delete(sampleRequests).where(eq(sampleRequests.id, id));

    return NextResponse.json({
      message: "Sample request deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting sample request:", error);
    return NextResponse.json(
      { error: "Failed to delete sample request" },
      { status: 500 }
    );
  }
}