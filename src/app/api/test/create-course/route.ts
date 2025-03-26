import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Form data with explicit ownerId field
    const formData = new FormData();
    formData.append('name', 'Test Course via API');
    formData.append('description', 'This is a test course created via direct API call');
    formData.append('ownerId', 'test-owner-123');
    
    // Get the API URL from environment variable or use default
    const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
    const endpoint = `${apiUrl}/v1/courses`;
    
    // Make a direct request to the API
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { text: responseText };
    }
    
    // Return the response for debugging
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      data
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
} 