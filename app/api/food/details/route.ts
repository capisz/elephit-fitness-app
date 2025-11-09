import { NextResponse } from 'next/server';
import { getFoodDetails } from '@/lib/fatsecret';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const foodId = searchParams.get('id');

  if (!foodId) {
    return NextResponse.json({ error: 'Food ID is required' }, { status: 400 });
  }

  try {
    const food = await getFoodDetails(foodId);
    return NextResponse.json({ food });
  } catch (error) {
    console.error('Error fetching food details:', error);
    return NextResponse.json({ error: 'Failed to fetch food details' }, { status: 500 });
  }
}
