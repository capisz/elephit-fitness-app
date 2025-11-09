import crypto from 'crypto';

const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';
const OAUTH_CONSUMER_KEY = process.env.OAUTH_CONSUMER_KEY;
const OAUTH_CONSUMER_SECRET = process.env.OAUTH_CONSUMER_SECRET;

if (!OAUTH_CONSUMER_KEY || !OAUTH_CONSUMER_SECRET) {
  throw new Error('OAuth credentials are missing. Check your .env.local file.');
}

function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function encodeRFC3986(str: string) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateSignatureBaseString(method: string, url: string, params: Record<string, string>) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeRFC3986(key)}=${encodeRFC3986(params[key])}`)
    .join('&');

  return `${method.toUpperCase()}&${encodeRFC3986(url)}&${encodeRFC3986(sortedParams)}`;
}

function generateSignature(signatureBaseString: string, consumerSecret: string) {
  const signingKey = `${encodeRFC3986(consumerSecret)}&`;
  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
}

export function generateOAuthParams(method: string, additionalParams: Record<string, string> = {}) {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: OAUTH_CONSUMER_KEY,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: generateTimestamp(),
    oauth_version: '1.0',
    ...additionalParams,
  };

  const signatureBaseString = generateSignatureBaseString(method, FATSECRET_BASE_URL, oauthParams);
  const signature = generateSignature(signatureBaseString, OAUTH_CONSUMER_SECRET);
  oauthParams.oauth_signature = encodeRFC3986(signature);

  return oauthParams;
}

export { FATSECRET_BASE_URL };
