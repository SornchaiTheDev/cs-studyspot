import { NextResponse } from 'next/server';
import { EnrolledCourse } from '@/app/(authed)/courses/types';

// Mock data for enrolled courses
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    progress: 78,
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 2,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    progress: 78,
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 3,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    progress: 78,
    imageUrl: "/images/course-placeholder.svg",
  },
];

/**
 * GET handler for enrolled courses
 * 
 * This is a placeholder API route for the backend team to implement.
 * It should return a list of courses that the current user is enrolled in.
 */
export async function GET() {
  // In a real implementation, this would:
  // 1. Authenticate the user
  // 2. Query the database for enrolled courses
  // 3. Return the courses with progress information
  
  // For now, return mock data
  return NextResponse.json(mockEnrolledCourses);
} 