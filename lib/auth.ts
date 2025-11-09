import { useState, useEffect } from 'react';

const TOKEN_ENDPOINT = 'https://oauth.nutritionix.com/oauth2/token';

interface AuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: AuthToken | null = null;
let tokenExpirationTime: number | null = null;

export async function getAuthToken(): Promise<string> {
  if (cachedToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return cachedToken.access_token;
  }

  const clientId = process.env.NUTRITIONIX_APP_ID;
  const clientSecret = process.env.NUTRITIONIX_API_KEY;

  if (!clientId || !clientSecret) {
    throw new Error('Nutritionix credentials are missing. Check your .env.local file.');
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token request failed:', errorText);
    throw new Error('Failed to obtain Nutritionix auth token');
  }

  const data: AuthToken = await response.json();
  cachedToken = data;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  return data.access_token;
}

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    getAuthToken().then(setToken).catch(console.error);
  }, []);

  return token;
}
