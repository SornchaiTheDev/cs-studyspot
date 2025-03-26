import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get form data from request
    const formData = await req.formData();
    
    // Extract course data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File | null;
    
    // Get the owner ID from the request or use a default
    const ownerId = formData.get('ownerId') as string || "test-owner-id";
    
    // Now call the real API
    const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
    const endpoint = `${apiUrl}/v1/courses`;
    
    // Create new FormData for the API request
    const apiFormData = new FormData();
    apiFormData.append('name', name);
    apiFormData.append('description', description);
    
    // Use ownerId field name to match the API
    apiFormData.append('ownerId', ownerId);
    
    // Add the cover image if provided
    if (coverImage) {
      apiFormData.append('coverImage', coverImage);
    }
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      body: apiFormData,
    });
    
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
      const text = await response.text();
      responseBody = { text };
    }
    
    // Return success response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      data: responseBody
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 