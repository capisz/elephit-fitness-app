import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // ✅ Send the request through your Fly.io proxy
    const proxyResponse = await fetch('https://fat-secret-proxy.fly.dev/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://platform.fatsecret.com/rest/server.api',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: {
          method: 'foods.search.v2',
          search_expression: query,
          format: 'json',
        },
      }),
    });

    if (!proxyResponse.ok) {
      const text = await proxyResponse.text();
      throw new Error(`Proxy error: ${text}`);
    }

    const data = await proxyResponse.json();
    const foods = data?.foods?.food?.map((food: any) => ({
      id: food.food_id,
      name: food.food_name,
      description: food.food_description || '',
      brand: food.brand_name || '',
    })) || [];

    return NextResponse.json({ foods });
  } catch (error) {
    console.error('Error in food search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred while searching for food' },
      { status: 500 }
    );
  }
}
