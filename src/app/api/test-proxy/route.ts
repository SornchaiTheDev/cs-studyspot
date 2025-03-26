import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint to verify proxy configuration
 */
export async function GET(req: NextRequest) {
  try {
    // Test connection to the real API
    const apiUrl = process.env.API_URL;
    console.log(`Testing connection to API at: ${apiUrl}`);
    
    const response = await fetch(`${apiUrl}/v1/courses?page=1&pageSize=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    let statusMessage = `API Status: ${response.status} ${response.statusText}`;
    console.log(statusMessage);
    
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { error: 'Failed to parse response as JSON' };
    }
    
    return NextResponse.json({
      success: response.ok,
      message: statusMessage,
      apiUrl,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_IS_PROXIED: process.env.NEXT_PUBLIC_IS_PROXIED,
      },
      response: responseData,
    });
  } catch (error) {
    console.error('Error in test-proxy route:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
      apiUrl: process.env.API_URL,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_IS_PROXIED: process.env.NEXT_PUBLIC_IS_PROXIED,
      },
    }, { status: 500 });
  }
} 