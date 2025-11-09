import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: Save user profile to database
  // TODO: Calculate initial calorie goal based on profile
  return NextResponse.json({ success: true })
}

export async function GET() {
  // TODO: Fetch user profile from database
  return NextResponse.json({ profile: {} })
}
