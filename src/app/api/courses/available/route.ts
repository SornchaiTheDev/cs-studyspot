import { NextResponse } from 'next/server';
import { AvailableCourse } from '@/app/(authed)/courses/types';

// Mock data for available courses
const mockAvailableCourses: AvailableCourse[] = [
  {
    id: 4,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 5,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 6,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 7,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.svg",
  },
  {
    id: 8,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.svg",
  },
];

/**
 * GET handler for available courses
 * 
 * This is a placeholder API route for the backend team to implement.
 * It should return a list of courses that the current user can enroll in.
 */
export async function GET() {
  // In a real implementation, this would:
  // 1. Authenticate the user
  // 2. Query the database for available courses (not enrolled by the user)
  // 3. Return the courses
  
  // For now, return mock data
  return NextResponse.json(mockAvailableCourses);
} 