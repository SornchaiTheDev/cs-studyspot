import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the session cookie directly from request
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = parseCookies(cookieHeader);
    
    // Parse session cookie if it exists
    let user: User | null = null;
    if (cookies.session) {
      try {
        user = JSON.parse(decodeURIComponent(cookies.session)) as User;
      } catch (e) {
        console.error('Failed to parse session cookie:', e);
      }
    }
    
    // Information to return
    const responseData = {
      user,
      userId: user?.id,
      cookies: Object.entries(cookies).map(([name, value]) => ({
        name,
        value: name === 'session' ? '***' : value.substring(0, 20) + '...'
      })),
      headers: Object.fromEntries(
        Array.from(req.headers.entries())
      ),
    };
    
    // Log the information for server-side debugging
    console.log("Debug user info:", JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in user-info route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Helper function to parse cookie string
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieString.split(';').forEach(cookie => {
    const parts = cookie.trim().split('=');
    if (parts.length >= 2) {
      const name = parts[0];
      const value = parts.slice(1).join('=');
      cookies[name] = value;
    }
  });
  return cookies;
} 