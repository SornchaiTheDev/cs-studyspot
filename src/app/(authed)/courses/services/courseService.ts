import { EnrolledCourse, AvailableCourse } from "../types";

// API endpoints
const API_ENDPOINTS = {
  ENROLLED_COURSES: "/api/courses/enrolled",
  AVAILABLE_COURSES: "/api/courses/available",
  JOIN_COURSE: "/api/courses/join",
};

/**
 * Fetch enrolled courses for the current user
 */
export const fetchEnrolledCourses = async (): Promise<EnrolledCourse[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.ENROLLED_COURSES);
    
    if (!response.ok) {
      throw new Error(`Error fetching enrolled courses: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch enrolled courses:", error);
    throw error;
  }
};

/**
 * Fetch available courses for the current user
 */
export const fetchAvailableCourses = async (): Promise<AvailableCourse[]> => {
  try {
    const response = await fetch(API_ENDPOINTS.AVAILABLE_COURSES);
    
    if (!response.ok) {
      throw new Error(`Error fetching available courses: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch available courses:", error);
    throw error;
  }
};

/**
 * Join a course
 * @param courseId - The ID of the course to join
 */
export const joinCourse = async (courseId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(API_ENDPOINTS.JOIN_COURSE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });
    
    if (!response.ok) {
      throw new Error(`Error joining course: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to join course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Get course progress
 * @param courseId - The ID of the course to get progress for
 */
export const getCourseProgress = async (courseId: number): Promise<{ progress: number }> => {
  try {
    const response = await fetch(`/api/courses/${courseId}/progress`);
    
    if (!response.ok) {
      throw new Error(`Error fetching course progress: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch progress for course ${courseId}:`, error);
    throw error;
  }
}; 