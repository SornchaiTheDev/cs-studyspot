import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // We can't log the FormData directly, so we'll convert what we can
    const formData = await req.formData();
    const data: Record<string, any> = {};
    
    // Log all form fields except file contents
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        data[key] = {
          name: value.name,
          type: value.type,
          size: value.size,
        };
      } else {
        data[key] = value;
      }
    }
    
    console.log('DEBUG Course Creation - Request body:', data);
    console.log('DEBUG Course Creation - Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Create a fake successful response
    const mockResponse = {
      id: "debug-course-" + Date.now(),
      name: data.name || "Debug Course",
      ownerId: data.ownerId || "unknown",
      coverImage: "/images/course-placeholder.png",
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(mockResponse, { status: 201 });
  } catch (error) {
    console.error('DEBUG Course Creation - Error:', error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
} 