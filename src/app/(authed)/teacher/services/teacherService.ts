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

export interface TeacherCoursesResponse {
  courses: TeacherCourse[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Fetches courses created by the teacher
 * @param userId - The ID of the user to filter courses by
 * @returns Promise<TeacherCoursesResponse>
 */
export async function fetchTeacherCourses(userId: string, page: number = 1, pageSize: number = 10): Promise<TeacherCoursesResponse> {
  let endpoint: string;
  
  if (useLocalApi()) {
    endpoint = API_ENDPOINTS.LOCAL_COURSES;
  } else if (useProxyForCORS()) {
    endpoint = API_ENDPOINTS.PROXY_COURSES;
  } else {
    endpoint = API_ENDPOINTS.COURSES;
  }
  
  // Add pagination parameters
  endpoint = `${endpoint}?page=${page}&pageSize=${pageSize}`;
  
  console.log('Fetching teacher courses with endpoint:', endpoint);
  
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
    console.log('Raw API response:', responseData);
    
    // Handle different API response structures
    let coursesArray: any[] = [];
    let pagination = {
      page: 1,
      totalPages: 1,
      totalItems: 0
    };
    
    if (Array.isArray(responseData)) {
      coursesArray = responseData;
    } else if (responseData && responseData.courses && Array.isArray(responseData.courses)) {
      coursesArray = responseData.courses;
      if (responseData.pagination) {
        pagination = {
          page: responseData.pagination.page || 1,
          totalPages: responseData.pagination.total_pages || responseData.pagination.totalPages || 1,
          totalItems: responseData.pagination.total_rows || responseData.pagination.totalItems || 0
        };
      }
    } else if (responseData && typeof responseData === 'object') {
      // Check for pagination structure
      if (responseData.data && Array.isArray(responseData.data)) {
        coursesArray = responseData.data;
        if (responseData.pagination) {
          pagination = {
            page: responseData.pagination.page || 1,
            totalPages: responseData.pagination.total_pages || responseData.pagination.totalPages || 1,
            totalItems: responseData.pagination.total_rows || responseData.pagination.totalItems || 0
          };
        }
      } else {
        const arrayProps = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
        if (arrayProps.length > 0) {
          coursesArray = responseData[arrayProps[0]];
        } else if (responseData.id) {
          coursesArray = [responseData];
        }
      }
    }
    
    console.log('Processed courses array:', coursesArray);
    
    // Transform the API data to match our UI expectations
    const transformedCourses = coursesArray.map((course: any) => {
      const teacherName = course.teacher || 'Instructor';
      
      // Process image URL
      let imageUrl = '';
      if (course.coverImage) {
        if (course.coverImage.startsWith('http')) {
          imageUrl = course.coverImage;
        } else {
          const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
          imageUrl = `${apiUrl}${course.coverImage.startsWith('/') ? '' : '/'}${course.coverImage}`;
        }
      }
      
      const transformed = {
        id: course.id,
        title: course.name || 'Untitled Course',
        description: course.description || '',
        instructor: teacherName,
        teacher: teacherName,
        imageUrl: imageUrl || '/images/course-placeholder.png',
        coverImageUrl: imageUrl || '/images/course-placeholder.png',
        createdAt: course.createdAt || new Date().toISOString(),
        ownerId: course.ownerId
      };
      return transformed;
    });
    
    console.log('Transformed courses:', transformedCourses);
    return {
      courses: transformedCourses,
      pagination
    };
  } catch (error) {
    console.error('Error in fetchTeacherCourses:', error);
    // Return mock data if API fails
    return {
      courses: mockTeacherCourses,
      pagination: {
        page: 1,
        totalPages: 1,
        totalItems: mockTeacherCourses.length
      }
    };
  }
}

/**
 * Create a new course
 * @param courseData Course data to create
 * @param userId ID of the course owner/creator
 * @returns Promise<TeacherCourse>
 */
export async function createCourse(newCourse: CourseCreate, userId: string): Promise<TeacherCourse> {
  const endpoint = API_ENDPOINTS.PROXY_COURSES;
  
  const formData = new FormData();
  formData.append('name', newCourse.name);
  formData.append('description', newCourse.description);
  formData.append('ownerId', userId);
  
  if (!newCourse.coverImage) {
    throw new Error('Cover image is required');
  }
  formData.append('coverImage', newCourse.coverImage);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (response.status === 409) {
    throw new Error('A course with this name already exists. Please choose a different name.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create course: ${response.status} - ${errorText}`);
  }

  return response.json();
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
      credentials: 'include',
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
      credentials: 'include',
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

export async function getTeacherCourses(userId: string): Promise<TeacherCourse[]> {
  const endpoint = useProxyForCORS()
    ? `${API_ENDPOINTS.PROXY_COURSES}?ownerId=${userId}`
    : `${API_ENDPOINTS.COURSES}?ownerId=${userId}`;

  console.log('Fetching teacher courses for userId:', userId);
  console.log('Using endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch teacher courses:', {
      status: response.status,
      error: errorText
    });
    throw new Error(`Failed to fetch teacher courses: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Raw API response:', responseData);

  // Handle different API response structures
  let coursesArray: any[] = [];
  
  if (Array.isArray(responseData)) {
    coursesArray = responseData;
  } else if (responseData && responseData.courses && Array.isArray(responseData.courses)) {
    coursesArray = responseData.courses;
  } else if (responseData && typeof responseData === 'object') {
    const arrayProps = Object.keys(responseData).filter(key => Array.isArray(responseData[key]));
    if (arrayProps.length > 0) {
      coursesArray = responseData[arrayProps[0]];
    } else if (responseData.id) {
      coursesArray = [responseData];
    }
  }

  console.log('All courses before transformation:', coursesArray);

  // Transform the API data to match our UI expectations
  const transformedCourses = coursesArray.map((course: any) => {
    const teacherName = course.teacher || 'Instructor';
    
    // Process image URL
    let imageUrl = '';
    if (course.coverImage) {
      if (course.coverImage.startsWith('http')) {
        imageUrl = course.coverImage;
      } else {
        const apiUrl = process.env.API_URL || 'https://api-cs-studyspot.sornchaithedev.com';
        imageUrl = `${apiUrl}${course.coverImage.startsWith('/') ? '' : '/'}${course.coverImage}`;
      }
    }

    return {
      id: course.id,
      title: course.name || 'Untitled Course',
      description: course.description || '',
      instructor: teacherName,
      teacher: teacherName,
      imageUrl: imageUrl || '/images/course-placeholder.png',
      coverImageUrl: imageUrl || '/images/course-placeholder.png',
      createdAt: course.createdAt || new Date().toISOString(),
      ownerId: course.ownerId
    };
  });

  console.log('All transformed courses:', transformedCourses);
  return transformedCourses;
} 