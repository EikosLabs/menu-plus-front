/**
 * API Proxy middleware for Astro SSR
 * Forwards /api requests to backend server
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function proxyApiRequest(request) {
  const url = new URL(request.url);
  
  // Only handle /api requests
  if (!url.pathname.startsWith('/api')) {
    return null;
  }

  // Build backend URL
  const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  // Copy headers
  const headers = {};
  request.headers.forEach((value, key) => {
    // Skip host header
    if (key.toLowerCase() !== 'host') {
      headers[key] = value;
    }
  });

  // Forward request to backend
  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    });

    // Copy response headers
    const responseHeaders = {};
    backendResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Return proxied response
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
