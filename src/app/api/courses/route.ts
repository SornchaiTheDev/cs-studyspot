import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

// In a real implementation, this would be replaced with a database model
interface Course {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Get the form data from the request
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const ownerId = formData.get('ownerId') as string;
    const coverImage = formData.get('coverImage') as File;

    // Validate the required fields
    if (!name || !description || !ownerId || !coverImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the course
    const courseId = uuidv4();

    // Handle file upload
    let coverImagePath = '';
    if (coverImage) {
      // Define the upload directory
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'courses', courseId);
      
      // Create the directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });
      
      // Get the file buffer
      const bytes = await coverImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Define the file path and save the file
      const filename = `cover-${Date.now()}-${coverImage.name}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      // Define the public path for the image
      coverImagePath = `/uploads/courses/${courseId}/${filename}`;
    }

    // Create the course object
    // In a real implementation, this would be saved to a database
    const newCourse: Course = {
      id: courseId,
      name,
      description,
      ownerId,
      coverImage: coverImagePath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // For a real implementation, save the course to a database here
    // await prisma.course.create({ data: newCourse });

    // Return the created course
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // Validate pagination parameters
    if (page < 1 || pageSize < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Mock data for now
    // In a real implementation, this would be fetched from a database
    const mockCourses: Course[] = [
      {
        id: uuidv4(),
        name: 'Introduction to Programming',
        description: 'Learn the basics of programming with this course',
        ownerId: uuidv4(),
        coverImage: '/images/course-placeholder.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Advanced Web Development',
        description: 'Take your web development skills to the next level',
        ownerId: uuidv4(),
        coverImage: '/images/course-placeholder.svg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Paginate the mock data
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedCourses = mockCourses.slice(startIndex, endIndex);

    // Return the paginated courses with pagination metadata
    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        page,
        total_page: Math.ceil(mockCourses.length / pageSize),
        total_rows: mockCourses.length,
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
} 