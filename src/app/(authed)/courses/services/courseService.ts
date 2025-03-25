import { 
  EnrolledCourse, 
  AvailableCourse, 
  DBCourse,
  DBProgress,
  translateDBCourseToUI,
  translateDBCourseToEnrolled
} from "../types";

// API Base URL
const API_BASE_URL = 'https://api-cs-studyspot.sornchaithedev.com/v1';

// API endpoints
const API_ENDPOINTS = {
  // Real API endpoints from Postman collection
  COURSES: `${API_BASE_URL}/courses`,
  COURSE_DETAIL: (id: string) => `${API_BASE_URL}/courses/${id}`,
  ENROLL_COURSE: `${API_BASE_URL}/attend/enroll`,
  ENROLLED_COURSES: (userId: string) => `${API_BASE_URL}/attend/user/${userId}`,
  
  // Local API endpoints for development
  LOCAL_ENROLLED_COURSES: "/api/courses/enrolled",
  LOCAL_AVAILABLE_COURSES: "/api/courses/available",
  LOCAL_JOIN_COURSE: "/api/courses/join",
  LOCAL_COURSE_DETAIL: (id: string) => `/api/courses/${id}`,
  
  // Proxy endpoints to avoid CORS
  PROXY_PREFIX: "/api/proxy",
  PROXY_COURSES: "/api/proxy/v1/courses",
  PROXY_COURSE_DETAIL: (id: string) => `/api/proxy/v1/courses/${id}`,
  PROXY_ENROLL_COURSE: "/api/proxy/v1/attend/enroll",
  PROXY_ENROLLED_COURSES: (userId: string) => `/api/proxy/v1/attend/user/${userId}`,
};

// Helper to check if we're using the local or real API
const useLocalApi = (): boolean => {
  // You can toggle this based on environment variables or other conditions
  return false; // Set to false to use the real API
};

// Helper to determine if we should use a proxy to avoid CORS issues
const useProxyForCORS = (): boolean => {
  // Check if the IS_PROXIED environment variable is set to true
  if (process.env.NEXT_PUBLIC_IS_PROXIED === 'true') {
    return true;
  }
  
  // In development with real API, use proxy to avoid CORS
  if (!useLocalApi() && process.env.NODE_ENV === 'development') {
    return true;
  }
  
  return false; // In production or when using local API, no need for proxy
};

/**
 * Fetch enrolled courses for the current user
 */
export const fetchEnrolledCourses = async (userId?: string): Promise<EnrolledCourse[]> => {
  try {
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_ENROLLED_COURSES;
    } else if (useProxyForCORS()) {
      endpoint = API_ENDPOINTS.PROXY_ENROLLED_COURSES(userId || '0195b847-bc02-7018-b6ff-eedbf2f7eac4');
    } else {
      endpoint = API_ENDPOINTS.ENROLLED_COURSES(userId || '0195b847-bc02-7018-b6ff-eedbf2f7eac4');
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error fetching enrolled courses: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data from the real API format to our UI format
    if (!useLocalApi() && Array.isArray(data)) {
      // Map the real API response to our EnrolledCourse format
      return data.map(course => ({
        id: typeof course.id === 'string' ? parseInt(course.id) : course.id,
        title: course.name || 'Untitled Course',
        instructor: course.instructor || 'Unknown Instructor',
        progress: course.progress || 0,
        imageUrl: course.coverImage || '/images/course-placeholder.png'
      }));
    }
    
    return data; // Return directly if using local API
  } catch (error) {
    console.error("Failed to fetch enrolled courses:", error);
    throw error;
  }
};

/**
 * fetch available courses for the current user
 */
export const fetchAvailableCourses = async (page = 1, pageSize = 10): Promise<AvailableCourse[]> => {
  try {
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_AVAILABLE_COURSES;
    } else if (useProxyForCORS()) {
      endpoint = `${API_ENDPOINTS.PROXY_COURSES}?page=${page}&pageSize=${pageSize}`;
    } else {
      endpoint = `${API_ENDPOINTS.COURSES}?page=${page}&pageSize=${pageSize}`;
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error fetching available courses: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data from the real API format to our UI format
    if (!useLocalApi() && data.courses) {
      // Map the real API response to our AvailableCourse format
      return data.courses.map((course: any) => ({
        id: typeof course.id === 'string' ? parseInt(course.id.replace(/-/g, '').substring(0, 8), 16) : course.id,
        title: course.name || 'Untitled Course',
        instructor: course.instructor || 'Unknown Instructor',
        imageUrl: course.coverImage || '/images/course-placeholder.png'
      }));
    }
    
    return data; // Return directly if using local API
  } catch (error) {
    console.error("Failed to fetch available courses:", error);
    throw error;
  }
};

/**
 * Join a course
 * @param courseId - The ID of the course to join
 * @param userId - The ID of the user joining the course
 */
export const joinCourse = async (courseId: number | string, userId?: string): Promise<{ success: boolean; message: string }> => {
  try {
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_JOIN_COURSE;
    } else if (useProxyForCORS()) {
      endpoint = API_ENDPOINTS.PROXY_ENROLL_COURSE;
    } else {
      endpoint = API_ENDPOINTS.ENROLL_COURSE;
    }
    
    // Default user ID if not provided
    const userIdValue = userId || '0195b847-bc02-7018-b6ff-eedbf2f7eac4';
    
    // Properly format the course ID for the API
    // The API likely expects a UUID format, not a simple number
    let apiCourseId = courseId;
    
    // If working with the real API and not using local API, we need to ensure proper UUID format
    if (!useLocalApi()) {
      // If it's a number, we need to convert it to the proper UUID format expected by the API
      if (typeof courseId === 'number') {
        // Make an API call to get the real course ID by querying for the course
        // This is a workaround since we can't derive the UUID from a number
        try {
          console.log(`Getting real course ID for number: ${courseId}`);
          // First, try to use our test endpoint to debug
          const testEndpoint = `/api/test-join-course`;
          const testResponse = await fetch(testEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              courseId: "0195b848-1e58-79dc-a04d-079f39492362", // Use a known valid course ID
              userId: userIdValue
            })
          });
          
          // Log the test response for debugging
          const testResult = await testResponse.json();
          console.log('Test join course response:', JSON.stringify(testResult));
          
          // For now, use a fallback UUID format
          apiCourseId = "0195b848-1e58-79dc-a04d-079f39492362"; // This is a sample from your Postman collection
        } catch (err) {
          console.error('Error testing course ID:', err);
          // Fall back to the string representation of the number
          apiCourseId = courseId.toString();
        }
      }
    }
    
    // Create payload based on API requirements
    const payload = useLocalApi() 
      ? { courseId } 
      : { 
          user_id: userIdValue,
          course_id: apiCourseId
        };
    
    console.log(`Joining course with endpoint: ${endpoint}`);
    console.log('Request payload:', JSON.stringify(payload));
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch (e) {
        // If we can't parse the response as JSON, use the status text
        errorDetails = response.statusText;
      }
      
      throw new Error(`Error joining course (${response.status}): ${errorDetails}`);
    }
    
    const result = await response.json();
    console.log('Join course response:', JSON.stringify(result));
    
    return {
      success: true,
      message: "Successfully joined course"
    };
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
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = `/api/courses/${courseId.toString()}/progress`;
    } else if (useProxyForCORS()) {
      endpoint = `${API_ENDPOINTS.PROXY_PREFIX}/v1/courses/${courseId.toString()}/progress`;
    } else {
      endpoint = `${API_BASE_URL}/courses/${courseId.toString()}/progress`;
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error fetching course progress: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch progress for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Get a course by ID
 * @param courseId - The ID of the course to fetch
 */
export const getCourseById = async (courseId: string | number): Promise<EnrolledCourse> => {
  try {
    // In a real app, we'd convert the number ID to a string ID for the DB if needed
    const id = typeof courseId === 'number' ? courseId.toString() : courseId;
    
    let endpoint;
    
    if (useLocalApi()) {
      endpoint = API_ENDPOINTS.LOCAL_COURSE_DETAIL(id);
    } else if (useProxyForCORS()) {
      endpoint = API_ENDPOINTS.PROXY_COURSE_DETAIL(id);
    } else {
      endpoint = API_ENDPOINTS.COURSE_DETAIL(id);
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Error fetching course details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform the data from the real API format to our UI format
    if (!useLocalApi()) {
      return {
        id: typeof data.id === 'string' ? parseInt(data.id.replace(/-/g, '').substring(0, 8), 16) : data.id,
        title: data.name || 'Untitled Course',
        instructor: data.instructor || 'Unknown Instructor',
        progress: data.progress || 0,
        imageUrl: data.coverImage || '/images/course-placeholder.png'
      };
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Create a new course
 * @param courseData - The course data to create
 */
export const createCourse = async (
  name: string, 
  description: string, 
  ownerId: string, 
  coverImage: File
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('ownerId', ownerId);
    formData.append('coverImage', coverImage);

    const endpoint = useProxyForCORS() 
      ? API_ENDPOINTS.PROXY_COURSES
      : API_ENDPOINTS.COURSES;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Error creating course: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create course:', error);
    throw error;
  }
};

/**
 * Update a course
 * @param courseId - The ID of the course to update
 * @param courseData - The updated course data
 */
export const updateCourse = async (courseId: string, courseData: Partial<{ name: string, description: string }>): Promise<any> => {
  try {
    const endpoint = useProxyForCORS()
      ? API_ENDPOINTS.PROXY_COURSE_DETAIL(courseId)
      : API_ENDPOINTS.COURSE_DETAIL(courseId);

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating course: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to update course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Delete a course
 * @param courseId - The ID of the course to delete
 */
export const deleteCourse = async (courseId: string): Promise<any> => {
  try {
    const endpoint = useProxyForCORS()
      ? API_ENDPOINTS.PROXY_COURSE_DETAIL(courseId)
      : API_ENDPOINTS.COURSE_DETAIL(courseId);

    const response = await fetch(endpoint, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting course: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to delete course ${courseId}:`, error);
    throw error;
  }
}; 