import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

// GET /api/customers - List all customers with optional search
export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereClause = undefined;
    if (search) {
      whereClause = or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customers.contactPerson, `%${search}%`)
      );
    }

    // Get customers
    const customersList = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        contactPerson: customers.contactPerson,
        status: customers.status,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: customers.id })
      .from(customers)
      .where(whereClause);

    return NextResponse.json({
      data: customersList,
      pagination: {
        page,
        limit,
        total: totalCount.length,
        totalPages: Math.ceil(totalCount.length / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}