// Define types for teacher courses
export interface TeacherCourse {
  id: string | number;
  title: string;
  description?: string;
  instructor?: string;
  teacher?: string;   // Add teacher field for consistency with API
  imageUrl?: string;
  coverImageUrl?: string;
  createdAt?: string;
  ownerId?: string;
}

// Database schema-aligned type
export interface Course {
  id: string;
  name: string;            // (instead of title)
  coverImage: string;     // (instead of imageUrl)
  description: string;     // (instead of detail)
  ownerId: string;         // Changed from owner_id to ownerId to match API
}

// Type for course creation 
export interface CourseCreate {
  name: string;
  description: string;
  coverImage?: File;      // Updated to handle File objects for API upload
}

// Mock data for teacher courses (fallback if API fails)
const mockTeacherCourses: TeacherCourse[] = [
  {
    id: 1,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 2,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 3,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 4,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 5,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
];

// Helper function to safely get env variables from window.env
const getEnv = (key: 'API_URL' | 'IS_PROXIED', defaultValue: string = ''): string => {
  // For server-side rendering, use process.env
  if (typeof window === 'undefined') {
    if (key === 'API_URL') return process.env.API_URL || defaultValue;
    if (key === 'IS_PROXIED') return process.env.NEXT_PUBLIC_IS_PROXIED || defaultValue;
    return defaultValue;
  }
  
  // For client-side, use window.env
  if (!window.env) return defaultValue;
  return window.env[key] || defaultValue;
};

// API Base URL - align with the environment variable
const API_BASE_URL = getEnv('API_URL', 'https://api-cs-studyspot.sornchaithedev.com');
const API_VERSION = '/v1';

// API endpoints
const API_ENDPOINTS = {
  // Real API endpoints from Postman collection
  COURSES: `${API_BASE_URL}${API_VERSION}/courses`,
  COURSE_DETAIL: (id: string) => `${API_BASE_URL}${API_VERSION}/courses/${id}`,
  
  // Local API endpoints for development
  LOCAL_COURSES: "/api/teacher/courses",
  LOCAL_COURSE_DETAIL: (id: string) => `/api/teacher/courses/${id}`,
  
  // Proxy endpoints to avoid CORS
  PROXY_PREFIX: "/api/proxy",
  PROXY_COURSES: "/api/proxy/v1/courses",
  PROXY_COURSE_DETAIL: (id: string) => `/api/proxy/v1/courses/${id}`,
  
  // Debug endpoints for testing
  DEBUG_CREATE_COURSE: "/api/debug/course-create"
};

// Helper to check if we're using the local or real API
const useLocalApi = (): boolean => {
  // You can toggle this based on environment variables or other conditions
  return false; // Set to false to use the real API
};

// Helper to determine if we should use a proxy to avoid CORS issues
const useProxyForCORS = (): boolean => {
  // Check if the IS_PROXIED environment variable is set to true
  if (getEnv('IS_PROXIED', 'false') === 'true') {
    return true;
  }
  
  // In development with real API, use proxy to avoid CORS
  if (!useLocalApi() && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false; // In production or when using local API, no need for proxy
};

// Helper function to handle S3 image URLs
const processImageUrl = (url: string): string => {
  if (!url) return '/images/course-placeholder.png';
  
  // Check if it's a minio-S3 URL
  if (url.includes('minio-S3') || url.includes('minio-s3')) {
    // Instead of using a proxy, use a local placeholder
    return '/images/course-placeholder.png';
  }
  
  return url;
};

/**
 * Fetches courses created by the teacher
 * @param userId - The ID of the user to filter courses by
 * @returns Promise<TeacherCourse[]>
 */
export async function fetchTeacherCourses(userId: string): Promise<TeacherCourse[]> {
  let endpoint: string;
  
  if (useLocalApi()) {
    endpoint = API_ENDPOINTS.LOCAL_COURSES;
  } else if (useProxyForCORS()) {
    endpoint = API_ENDPOINTS.PROXY_COURSES;
  } else {
    endpoint = API_ENDPOINTS.COURSES;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error fetching teacher courses: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Handle different API response structures
    // The API might return data in an object with a courses property, or directly as an array
    let coursesArray: any[] = [];
    
    if (Array.isArray(responseData)) {
      // If the response is already an array, use it directly
      coursesArray = responseData;
    } else if (responseData && responseData.courses && Array.isArray(responseData.courses)) {
      // If the response has a courses property that is an array, use that
      coursesArray = responseData.courses;
    } else if (responseData && typeof responseData === 'object') {
      // If the response is an object but not in the expected format, try to extract data
      // Check if there are any array properties in the response
      const arrayProps = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
      if (arrayProps.length > 0) {
        // Use the first array property found
        coursesArray = responseData[arrayProps[0]];
      } else {
        // If no arrays found, treat the object as a single course and wrap in array
        if (responseData.id) {
          coursesArray = [responseData];
        } else {
          coursesArray = [];
        }
      }
    }
    
    // Filter courses by owner ID (userId) or teacher field
    const teacherCourses = coursesArray.filter((course: any) => {
      // Check multiple possible owner ID fields
      const courseOwnerId = course.ownerId || course.owner_id || course.teacherId || course.userId;
      const teacherName = course.teacher;
      
      // First try: Match by owner ID
      if (courseOwnerId && 
         (courseOwnerId === userId || 
          courseOwnerId.toString() === userId.toString())) {
        return true;
      }
      
      // Second try: Check if the course's teacher field contains the user's ID
      if (teacherName && userId && teacherName.toString().includes(userId)) {
        return true;
      }
      
      // Third try: Use a stored constant to identify the user as teacher
      // (Consider storing your user's name in a constant to match against)
      const currentUserInfo = ["Natthapat YIMLAMAI", "Natthapat"];
      if (teacherName && currentUserInfo.some(info => 
          teacherName.toString().includes(info))) {
        return true;
      }
      
      // Skip courses not owned by the user
      return false;
    });
    
    // Transform the API data to match our UI expectations
    const transformedCourses = teacherCourses.map((course: any) => {
      // Extract teacher name if available
      const teacherName = course.teacher || 'Instructor';
      
      // Process image URL
      let imageUrl = '';
      if (course.coverImage) {
        // If it's a full URL, use it as is
        if (course.coverImage.startsWith('http')) {
          imageUrl = course.coverImage;
        } else {
          // If it's a relative path, construct a full URL
          const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
          imageUrl = `${apiUrl}${course.coverImage.startsWith('/') ? '' : '/'}${course.coverImage}`;
        }
      }
      
      const transformed = {
        id: course.id,
        title: course.name || 'Untitled Course',
        description: course.description || '',
        instructor: teacherName,
        teacher: teacherName, // Keep original field name for reference
        imageUrl: imageUrl,
        coverImageUrl: imageUrl,
        createdAt: course.createdAt || new Date().toISOString(),
        ownerId: course.ownerId
      };
      return transformed;
    });
    
    return transformedCourses;
  } catch (error) {
    // Return mock data if API fails
    return mockTeacherCourses;
  }
}

/**
 * Create a new course
 * @param courseData Course data to create
 * @param userId ID of the course owner/creator
 * @returns Promise<TeacherCourse>
 */
export async function createCourse(newCourse: CourseCreate, userId: string): Promise<TeacherCourse> {
  let endpoint: string;
  
  if (useLocalApi()) {
    // Use the local API
    endpoint = '/api/manual/create-course';
  } else {
    // Use the real API
    endpoint = `${API_ENDPOINTS.COURSES}`;
  }
  
  const formData = new FormData();
  formData.append('name', newCourse.name || 'New Course');
  formData.append('description', newCourse.description || '');
  
  // Always include ownerId in the form data
  formData.append('ownerId', userId);
  
  if (newCourse.coverImage) {
    formData.append('coverImage', newCourse.coverImage);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create course: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Process image URL
    let imageUrl = '';
    if (data.coverImage) {
      // If it's a full URL, use it as is
      if (data.coverImage.startsWith('http')) {
        imageUrl = data.coverImage;
      } else {
        // If it's a relative path, construct a full URL
        const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
        imageUrl = `${apiUrl}${data.coverImage.startsWith('/') ? '' : '/'}${data.coverImage}`;
      }
    }
    
    // Transform API response to UI format
    return {
      id: data.id || 'temp-id',
      title: data.name || 'New Course',
      description: data.description || '',
      imageUrl: imageUrl,
      coverImageUrl: imageUrl,
      createdAt: new Date().toISOString(),
      ownerId: userId
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a course
 * @param courseId ID of the course to delete
 * @returns Promise<void>
 */
export const deleteCourse = async (courseId: number | string): Promise<void> => {
  try {
    // Make sure we have a string ID for the API
    const id = typeof courseId === 'number' ? courseId.toString() : courseId;
    
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_COURSE_DETAIL(id);
    } else if (useProxyForCORS()) {
      endpoint = API_ENDPOINTS.PROXY_COURSE_DETAIL(id);
    } else {
      endpoint = API_ENDPOINTS.COURSE_DETAIL(id);
    }
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting course: ${response.statusText}`);
    }
    
    // Successfully deleted
    return;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a course
 * @param courseId ID of the course to update
 * @param courseData Data to update
 * @returns Promise<TeacherCourse>
 */
export const updateCourse = async (
  courseId: number | string, 
  courseData: Partial<CourseCreate>
): Promise<TeacherCourse> => {
  try {
    // Make sure we have a string ID for the API
    const id = typeof courseId === 'number' ? courseId.toString() : courseId;
    
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_COURSE_DETAIL(id);
    } else if (useProxyForCORS()) {
      endpoint = API_ENDPOINTS.PROXY_COURSE_DETAIL(id);
    } else {
      endpoint = API_ENDPOINTS.COURSE_DETAIL(id);
    }
    
    // For the real API, we need to convert to their expected format
    const apiData: Record<string, any> = {};
    
    if (courseData.name) apiData.name = courseData.name;
    if (courseData.description) apiData.description = courseData.description;
    
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating course: ${response.statusText}`);
    }
    
    const updatedCourse = await response.json();
    
    // Transform the API response to our TeacherCourse format
    return {
      id: updatedCourse.id || courseId,
      title: updatedCourse.name || courseData.name || 'Untitled Course',
      instructor: updatedCourse.instructor || 'Current User',
      imageUrl: processImageUrl(updatedCourse.coverImage)
    };
  } catch (error) {
    throw error;
  }
}; 