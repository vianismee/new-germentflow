import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey ||
      supabaseUrl.includes('your-project-id') ||
      supabaseAnonKey.includes('placeholder')) {
    return NextResponse.json({
      configured: false,
      error: 'Supabase environment variables are not properly configured'
    })
  }

  return NextResponse.json({ configured: true })
}