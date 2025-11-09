// lib/fatsecret_auth.ts

export const BASE_URL =
  process.env.FATSECRET_BASE_URL ||
  'https://platform.fatsecret.com/rest/server.api';

/**
 * Get a valid access token from your Fly.io proxy.
 * The proxy handles your client credentials securely.
 */
export async function getFatSecretToken(): Promise<string> {
  const PROXY_URL =
    process.env.FATSECRET_PROXY_URL ||
    'https://fat-secret-proxy.fly.dev/token'; // your Fly.io proxy endpoint

  try {
    const res = await fetch(PROXY_URL);
    if (!res.ok) throw new Error(`Proxy token fetch failed: ${res.status}`);

    const data = await res.json();
    if (!data.access_token)
      throw new Error('Invalid token response from proxy');

    return data.access_token;
  } catch (err) {
    console.error('❌ Error fetching token from proxy:', err);
    throw err;
  }
}
