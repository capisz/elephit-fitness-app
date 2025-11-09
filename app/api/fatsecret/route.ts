import { NextResponse } from "next/server";

const FATSECRET_API_URL = "https://platform.fatsecret.com/rest/server.api";
const PROXY_URL = process.env.NEXT_PUBLIC_FATSECRET_PROXY_URL || "https://fat-secret-proxy.fly.dev";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${PROXY_URL}/proxy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: FATSECRET_API_URL,
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: {
          method: "foods.search",
          search_expression: query,
          format: "json",
        },
      }),
    });

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Proxy returned invalid JSON:", raw);
      throw new Error("Proxy returned invalid JSON");
    }

    if (!response.ok) {
      console.error("Proxy returned error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in FatSecret API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
