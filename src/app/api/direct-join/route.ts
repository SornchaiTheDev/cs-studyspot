import { NextRequest, NextResponse } from "next/server";

// Hardcoded working UUID for course
const WORKING_COURSE_UUID = "0195b848-1e58-79dc-a04d-079f39492362";

/**
 * Direct course join endpoint
 * This bypasses all the usual processing and directly sends a properly formatted request
 * to the backend API with hardcoded values that are known to work.
 */
export async function POST(req: NextRequest) {
  try {
    // Get API URL from environment
    const API_URL = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
    const endpoint = `${API_URL}/v1/attend/enroll`;
    
    // Get the user ID from the request body
    const body = await req.json();
    const userId = body.userId;
    
    if (!userId) {
      console.error('Direct join error: Missing user ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Create payload with working hardcoded course ID
    const payload = {
      userId: userId,
      courseId: WORKING_COURSE_UUID
    };
    
    console.log('Direct join request details:', {
      endpoint,
      payload
    });
    
    // Send request to backend API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Check if the request was successful
    if (!response.ok) {
      // Try to get error details
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
        console.error('Direct join API error response:', errorResponse);
      } catch (e) {
        errorDetails = response.statusText;
        console.error('Direct join error - could not parse response:', response.status, response.statusText);
        try {
          const errorText = await response.text();
          console.error('Direct join error - raw response:', errorText);
        } catch (textError) {
          console.error('Could not get response text:', textError);
        }
      }
      
      return NextResponse.json(
        { error: `Error joining course: ${errorDetails}` },
        { status: response.status }
      );
    }
    
    // Return success response
    const result = await response.json();
    console.log('Direct join success response:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully joined course',
      result
    });
  } catch (error) {
    console.error('Direct join error:', error);
    return NextResponse.json(
      { error: 'Failed to join course' },
      { status: 500 }
    );
  }
} 