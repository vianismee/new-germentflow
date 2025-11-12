import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sampleRequests, sampleStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase/client";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/sample-requests/[id]/status - Change sample request status
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    // For now, skip authentication to match other APIs in the project
    const userId = "default-user"; // Temporary default user ID

    const body = await request.json();
    const { status, changeReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Check if sample request exists
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

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      "draft": ["on_review", "approved", "canceled"], // Allow direct draft to approved
      "on_review": ["approved", "revision", "canceled"],
      "approved": [], // Approved is final state
      "revision": ["on_review", "approved", "canceled"], // Allow revision to approved
      "canceled": [] // Canceled is final state
    };

    if (validTransitions[existingSample.status] && !validTransitions[existingSample.status].includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${existingSample.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update sample request status
    const [updatedSample] = await db
      .update(sampleRequests)
      .set({
        status: status,
        updatedAt: new Date()
      })
      .where(eq(sampleRequests.id, id))
      .returning();

    // Create status history entry
    await db.insert(sampleStatusHistory).values({
      id: nanoid(),
      sampleRequestId: id,
      previousStatus: existingSample.status,
      newStatus: status,
      changedBy: userId,
      changeReason: changeReason || null,
      changedAt: new Date()
    });

    return NextResponse.json({
      message: "Sample request status updated successfully",
      data: updatedSample
    });

  } catch (error) {
    console.error("Error updating sample request status:", error);
    return NextResponse.json(
      { error: "Failed to update sample request status" },
      { status: 500 }
    );
  }
}