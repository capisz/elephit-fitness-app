import { NextResponse } from 'next/server';

const PROXY_URL = 'https://fat-secret-proxy.fly.dev/proxy'; // your working proxy

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    if (!query) return NextResponse.json({ foods: [] }, { status: 200 });

    // Build body to send through proxy
    const body = {
      method: 'foods.search', // keep the free-tier method
      search_expression: query,
      format: 'json',
    };

    // POST to your Fly.io proxy
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://platform.fatsecret.com/rest/server.api',
        method: 'POST',
        body,
      }),
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('❌ Invalid JSON from proxy:', text);
      return NextResponse.json({ foods: [] }, { status: 200 });
    }

    const raw = json?.foods?.food;
    const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const foods = arr.map((f: any) => {
      const desc = f.food_description || '';
      const pick = (re: RegExp) => {
        const m = desc.match(re);
        return m ? parseFloat(m[1]) : 0;
      };
      return {
        id: String(f.food_id),
        name: f.food_name,
        calories: pick(/Calories:\s*(\d+)/),
        protein: pick(/Protein:\s*([\d.]+)/),
        carbs: pick(/Carbs:\s*([\d.]+)/),
        fat: pick(/Fat:\s*([\d.]+)/),
        brand: f.brand_name || null,
        type: f.food_type || null,
      };
    });

    return NextResponse.json({ foods }, { status: 200 });
  } catch (e) {
    console.error('🔥 Error in /api/food-search:', e);
    return NextResponse.json({ foods: [] }, { status: 200 });
  }
}
