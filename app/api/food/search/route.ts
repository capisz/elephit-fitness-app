import { NextResponse } from 'next/server';
import { searchFoods } from '@/lib/fatsecret';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const foods = await searchFoods(query);
    return NextResponse.json({ foods });
  } catch (error) {
    console.error('Error in food search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred while searching for food' },
      { status: 500 }
    );
  }
}
