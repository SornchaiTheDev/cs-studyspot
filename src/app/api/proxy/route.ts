import { NextRequest, NextResponse } from "next/server";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RouteHandler = (req: NextRequest, method: Method) => Promise<Response>;

const handler: RouteHandler = async (req, method) => {
  try {
    const path = req.nextUrl.pathname.substring("/api/proxy".length);
    const searchQuery = req.nextUrl.search;
    const apiUrl = process.env.API_URL + path + searchQuery;
    
    console.log(`[Proxy] ${method} request to ${apiUrl}`);
    
    // Clone the request headers for debugging
    const requestHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      requestHeaders[key] = value;
    });
    
    // For debugging, log the request body if it's a POST
    let requestBody = null;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        // Clone the request to read the body
        const clonedReq = req.clone();
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          requestBody = await clonedReq.json();
          console.log('[Proxy] Request body:', JSON.stringify(requestBody));
        }
      } catch (e) {
        console.error('[Proxy] Error reading request body:', e);
      }
    }
    
    const res = await fetch(apiUrl, {
      method,
      body: req.body,
      headers: req.headers,
      credentials: "include",
      duplex: "half",
    } as RequestInit);
    
    console.log(`[Proxy] Response status: ${res.status} ${res.statusText}`);
    
    // Debug response headers
    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('[Proxy] Response headers:', JSON.stringify(responseHeaders));
    
    // Clone the response to read its body
    const clonedRes = res.clone();
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const responseBody = await clonedRes.json();
        console.log('[Proxy] Response body:', JSON.stringify(responseBody));
      }
    } catch (e) {
      console.error('[Proxy] Error reading response body:', e);
    }

    const redirectTo = res.headers.get("X-Redirect-To");
    if (redirectTo) {
      const nextRes = NextResponse.redirect(new URL(redirectTo, req.nextUrl));
      nextRes.headers.set("Set-Cookie", res.headers.get("Set-Cookie") ?? "");
      return nextRes;
    }

    return new Response(res.body, {
      headers: res.headers,
      status: res.status,
      statusText: res.statusText,
    });
  } catch (error) {
    console.error('[Proxy] Error processing request:', error);
    
    // Return a detailed error response for debugging
    return new Response(
      JSON.stringify({
        error: 'Internal proxy error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        path: req.nextUrl.pathname,
        method: method,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

export const GET = (req: NextRequest) => handler(req, "GET");
export const POST = (req: NextRequest) => handler(req, "POST");
export const PUT = (req: NextRequest) => handler(req, "PUT");
export const PATCH = (req: NextRequest) => handler(req, "PATCH");
export const DELETE = (req: NextRequest) => handler(req, "DELETE");
