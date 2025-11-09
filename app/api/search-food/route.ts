import { NextResponse } from 'next/server'

const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    console.log('Initiating Nutritionix API request for query:', query);
    const response = await fetch(`${NUTRITIONIX_API_URL}/search/instant?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'x-app-id': process.env.NUTRITIONIX_APP_ID!,
        'x-app-key': process.env.NUTRITIONIX_API_KEY!,
      },
    });

    if (!response.ok) {
      console.error('Nutritionix API error:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Nutritionix API response:', data);

    if (!data || !Array.isArray(data.common)) {
      console.error('Unexpected API response structure:', data);
      return NextResponse.json({ error: 'Unexpected API response structure' }, { status: 500 })
    }

    const results = data.common.slice(0, 5).map((item: any) => ({
      food_name: item.food_name || '',
      nf_calories: item.nf_calories || 0,
      nf_protein: item.nf_protein || 0,
      nf_total_carbohydrate: item.nf_total_carbohydrate || 0,
      nf_total_fat: item.nf_total_fat || 0,
    }));

    console.log('Processed results:', results);
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in searchFood:', error);
    return NextResponse.json({ error: 'An error occurred while searching for food' }, { status: 500 })
  }
}
