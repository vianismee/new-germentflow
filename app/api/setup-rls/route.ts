import { NextRequest, NextResponse } from 'next/server'
import { setupSQLExecutor, runMigrations } from '@/lib/database/migrate'

export async function POST(request: NextRequest) {
  try {
    // Setup SQL executor function first
    await setupSQLExecutor()

    // Run RLS migrations
    const result = await runMigrations()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('RLS Setup Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST request to this endpoint to set up RLS policies',
    usage: 'POST /api/setup-rls'
  })
}