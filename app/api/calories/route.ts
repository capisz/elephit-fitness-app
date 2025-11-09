import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Calculate and return daily calorie goal and consumption
  return NextResponse.json({ goal: 2000, consumed: 0 })
}
