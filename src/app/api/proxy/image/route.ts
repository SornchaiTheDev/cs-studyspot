import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint proxies images from the minio-S3 server
 * This is useful for cases where the Next.js image optimization has trouble with S3 directly
 */
export async function GET(request: NextRequest) {
  try {
    // Get the image URL from the query parameters
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' }, 
        { status: 400 }
      );
    }
    
    // Log the requested image URL
    console.log(`Image proxy requesting: ${imageUrl}`);
    
    // Attempt to fetch the image from the original source
    let response;
    try {
      response = await fetch(imageUrl, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error 
        ? fetchError.message 
        : 'Unknown fetch error';
      console.error(`Error fetching image: ${errorMessage}`);
      // Redirect to placeholder on fetch error
      return NextResponse.redirect(new URL('/images/course-placeholder.png', request.url));
    }
    
    if (!response.ok) {
      console.error(`Bad response from image source: ${response.status} ${response.statusText}`);
      // Redirect to placeholder instead of failing
      return NextResponse.redirect(new URL('/images/course-placeholder.png', request.url));
    }
    
    // Get the image data and content type
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log(`Successfully proxied image (${contentType}, ${imageBuffer.byteLength} bytes)`);
    
    // Create a new response with the image data
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error';
    console.error(`Image proxy error: ${errorMessage}`);
    // Redirect to placeholder instead of failing
    return NextResponse.redirect(new URL('/images/course-placeholder.png', request.url));
  }
} 