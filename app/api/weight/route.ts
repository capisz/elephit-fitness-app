import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  // TODO: Save daily weight to database
  // TODO: Recalculate calorie goal based on weight change
  return NextResponse.json({ success: true })
}

export async function GET() {
  // TODO: Fetch weight history from database
  return NextResponse.json({ weights: [] })
}
