import type { APIRoute } from 'astro';

const BACKEND_URL = process.env.API_BACKEND_URL || 'http://localhost:8080';

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || '';
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/api/${path}${url.search}`;

  const contentType = request.headers.get('content-type') || '';
  const isMultipart = contentType.includes('multipart/form-data');

  // Copy headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // Skip host and content-length (will be recalculated)
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
      headers[key] = value;
    }
  });

  let body: BodyInit | null = null;

  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (isMultipart) {
      // For multipart, pass the request body as-is using arrayBuffer
      const arrayBuffer = await request.arrayBuffer();
      body = arrayBuffer;
      // Set content-length for the actual body size
      headers['content-length'] = String(arrayBuffer.byteLength);
      console.log(`[API Route] ${request.method} /api/${path} - Multipart upload: ${arrayBuffer.byteLength} bytes`);
    } else {
      // For JSON/text, read as text
      body = await request.text();
      console.log(`[API Route] ${request.method} /api/${path} - Body: ${(body as string)?.substring(0, 100)}...`);
    }
  }

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    if (body) {
      fetchOptions.body = body;
    }

    const backendResponse = await fetch(backendUrl, fetchOptions);

    // Copy response headers
    const responseHeaders: Record<string, string> = {};
    backendResponse.headers.forEach((value, key) => {
      // Skip headers that shouldn't be copied
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    const responseBody = await backendResponse.text();

    return new Response(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Route] Error:', error);
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Export individual methods
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
