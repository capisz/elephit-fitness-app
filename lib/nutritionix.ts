export interface NutritionixSearchResult {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
}

export async function searchFood(query: string): Promise<NutritionixSearchResult[]> {
  const appId = process.env.NUTRITIONIX_APP_ID;
  const apiKey = process.env.NUTRITIONIX_API_KEY;

  if (!appId || !apiKey) {
    throw new Error('Nutritionix API credentials missing in environment variables.');
  }

  const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'x-app-id': appId,
      'x-app-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Nutritionix API error:', errorText);
    throw new Error('Failed to fetch Nutritionix data');
  }

  const data = await response.json();
  return data.common || [];
}
