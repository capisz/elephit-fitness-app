import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

/**
 * 🔐 OAuth 2.0 token endpoint
 * Your Next.js app fetches /token to get an access_token securely.
 */
app.get("/token", async (req, res) => {
  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Missing FatSecret OAuth2 credentials" });
  }

  try {
    const response = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "basic",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("FatSecret token fetch failed:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy token route error:", err);
    res.status(500).json({ error: "Proxy token request failed" });
  }
});

/**
 * 🧮 OAuth 1.0 signing proxy (your existing code)
 */
app.post("/proxy", async (req, res) => {
  const { url, method, headers, body } = req.body;

  const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
  const sharedSecret = process.env.FATSECRET_SHARED_SECRET;

  if (!consumerKey || !sharedSecret) {
    return res.status(500).json({ error: "Missing FatSecret keys" });
  }

  try {
    const oauthParams = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: Math.random().toString(36).substring(2),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: "1.0",
    };

    const allParams = { ...body, ...oauthParams };
    const sortedEntries = Object.entries(allParams).sort(([a], [b]) => a.localeCompare(b));

    const paramString = sortedEntries
      .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
      .join("&");

    const baseURL = url.split("?")[0];
    const baseString = `${method.toUpperCase()}&${percentEncode(baseURL)}&${percentEncode(paramString)}`;
    const signingKey = `${sharedSecret}&`;
    const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");

    const finalParams = { ...Object.fromEntries(sortedEntries), oauth_signature: signature };
    const formBody = new URLSearchParams(finalParams).toString();

    console.log("---- DEBUG ----");
    console.log("Base string:", baseString);
    console.log("Signing key:", signingKey);
    console.log("----------------");

    const response = await fetch(baseURL, {
      method,
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...headers },
      body: formBody,
    });

    const text = await response.text();
    res.type("application/json").send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed" });
  }
});

app.get("/", (req, res) => res.send("✅ FatSecret Proxy is running"));

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
