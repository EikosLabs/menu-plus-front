/**
 * API Proxy middleware for Astro SSR
 * Forwards /api requests to backend server
 */

const BACKEND_URL = process.env.API_BACKEND_URL || 'http://menusesqr-back:8080';

export async function proxyApiRequest(request) {
  const url = new URL(request.url);
  
  // Only handle /api requests
  if (!url.pathname.startsWith('/api')) {
    return null;
  }

  // Build backend URL
  const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  // Copy headers and handle body properly
  const headers = {};
  let body = null;

  request.headers.forEach((value, key) => {
    // Skip host header and content-length (will be set automatically)
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
      headers[key] = value;
    }
  });

  // Only read body for POST, PUT, PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    body = await request.text();
  }

  // Forward request to backend
  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body,
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
