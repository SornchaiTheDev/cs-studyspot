import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint specifically for the join course functionality
 */
export async function POST(req: NextRequest) {
  try {
    // Get parameters from request
    const { courseId, userId } = await req.json();
    
    if (!courseId || !userId) {
      return NextResponse.json({
        success: false,
        message: "Missing required parameters: courseId and userId are required"
      }, { status: 400 });
    }
    
    // Test connection to the real API for course enrollment
    const apiUrl = process.env.API_URL;
    console.log(`Testing course enrollment API at: ${apiUrl}/v1/attend/enroll`);
    console.log(`Joining course: ${courseId} for user: ${userId}`);
    
    // Prepare the payload according to the API expectations
    const payload = {
      user_id: userId,
      course_id: courseId
    };
    
    console.log('Request payload:', JSON.stringify(payload));
    
    const response = await fetch(`${apiUrl}/v1/attend/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    let statusMessage = `API Status: ${response.status} ${response.statusText}`;
    console.log(statusMessage);
    
    // Try to parse the response
    let responseData;
    try {
      responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData));
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      responseData = { error: 'Failed to parse response as JSON' };
    }
    
    return NextResponse.json({
      success: response.ok,
      message: statusMessage,
      apiUrl: `${apiUrl}/v1/attend/enroll`,
      request: payload,
      response: responseData,
    }, { status: response.ok ? 200 : response.status });
  } catch (error) {
    console.error('Error in test-join-course route:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 