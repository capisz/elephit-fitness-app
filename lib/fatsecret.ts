/**
 * FatSecret API helpers via Fly.io proxy
 * - Uses OAuth 1.0 signing handled server-side
 * - Safe for client-side calls (no exposed keys)
 */

const PROXY_URL = "https://fat-secret-proxy.fly.dev/proxy";

/**
 * Searches foods and normalizes the data for UI use.
 */
export async function searchFoods(query: string) {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://platform.fatsecret.com/rest/server.api",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: {
        method: "foods.search",
        search_expression: query,
        format: "json",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Proxy error:", text);
    throw new Error("Failed to fetch foods");
  }

  const data = await response.json();
  const foods = data.foods?.food || [];

  // Normalize the results
  return (Array.isArray(foods) ? foods : [foods]).map((item: any) => {
    const desc = item.food_description || "";
    return {
      id: item.food_id,
      name: item.food_name,
      calories: parseFloat(desc.match(/Calories: (\d+)/)?.[1] || "0"),
      protein: parseFloat(desc.match(/Protein: ([\d.]+)/)?.[1] || "0"),
      carbs: parseFloat(desc.match(/Carbs: ([\d.]+)/)?.[1] || "0"),
      fat: parseFloat(desc.match(/Fat: ([\d.]+)/)?.[1] || "0"),
      brand: item.brand_name || "",
      type: item.food_type || "",
    };
  });
}

/**
 * Fetches details for a specific food item.
 */
export async function getFoodDetails(foodId: string) {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://platform.fatsecret.com/rest/server.api",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: {
        method: "food.get.v3",
        food_id: foodId,
        format: "json",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Proxy error (details):", text);
    throw new Error("Failed to fetch food details");
  }

  const data = await response.json();
  return data.food || {};
}
