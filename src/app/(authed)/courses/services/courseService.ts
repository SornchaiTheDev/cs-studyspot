import { api } from "@/libs/api";
import { EnrolledCourse, AvailableCourse } from "../types";

// Define a type-safe way to access window.env
declare global {
  interface Window {
    env: {
      API_URL: string;
      IS_PROXIED: string;
    };
  }
}

// API endpoints
export const API_ENDPOINTS = {
  // Real API endpoints from Postman collection
  COURSES: `/v1/courses`,
  COURSE_DETAIL: (id: string) => `/v1/courses/${id}`,
  ENROLL_COURSE: `/v1/attend/enroll`,
  ENROLLED_COURSES: `/v1/attend/user`,
  USER_DETAIL: (userId: string) => `/v1/users/${userId}`,
};

// Helper function to handle S3 image URLs
const processImageUrl = (url: string): string => {
  if (!url) return "/images/course-placeholder.png";

  // Check if it's a minio-S3 URL
  if (url.includes("minio-S3") || url.includes("minio-s3")) {
    // Instead of using a proxy, use a local placeholder
    return "/images/course-placeholder.png";
  }

  return url;
};

/**
 * Fetch enrolled courses for the current user
 */
export const fetchEnrolledCourses = async (
  userId?: string,
): Promise<EnrolledCourse[]> => {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch enrolled courses");
    }

    const endpoint = API_ENDPOINTS.ENROLLED_COURSES;

    const response = await api.get(endpoint);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching enrolled courses: ${response.status} ${response.statusText}`,
      );
    }

    const rawData = response.data;

    // Extract courses array from response, handling different formats
    let data = rawData;

    // Check if the response is an object with a 'courses' property (new format)
    if (
      !Array.isArray(rawData) &&
      typeof rawData === "object" &&
      rawData !== null &&
      "courses" in rawData
    ) {
      data = rawData.courses;
    }

    if (!Array.isArray(data)) {
      return []; // Return empty array if format is unexpected
    }

    // Transform the data from the real API format to our UI format
    if (Array.isArray(data)) {
      // Map the real API response to our EnrolledCourse format
      const courses = data.map((course) => {
        // Extract teacher name using same approach as teacher page
        const teacherName =
          course.teacher ||
          course.instructor ||
          course.ownerName ||
          (course.owner && course.owner.name) ||
          "Instructor";

        // Process image URL
        let imageUrl = "";
        if (course.coverImage) {
          imageUrl = processImageUrl(course.coverImage);
        } else {
          imageUrl = "/images/course-placeholder.png";
        }

        // Use the original ID directly as both id and originalId
        const courseId = course.id;

        const transformedCourse = {
          id: courseId,
          originalId: courseId, // Preserve the original UUID
          title: course.name || "Untitled Course",
          instructor: teacherName,
          progress: course.progressPercentage || 0,
          imageUrl: imageUrl,
        };

        return transformedCourse;
      });

      return courses;
    }

    return []; // Return empty array if we couldn't process the data
  } catch (error: any) {
    // If this is a network error, throw a more specific error to help with retry logic
    if (
      error.message?.includes("fetch failed") ||
      error.message?.includes("network")
    ) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error; // Rethrow the error so it can be handled by the caller
  }
};

/**
 * fetch available courses for the current user
 */
export const fetchAvailableCourses = async (
  page = 1,
  pageSize = 10,
): Promise<AvailableCourse[]> => {
  try {
    const endpoint = `${API_ENDPOINTS.COURSES}?page=${page}&pageSize=${pageSize}`;

    const response = await api.get(endpoint);

    if (response.status !== 200) {
      throw new Error(
        `Error fetching available courses: ${response.status} ${response.statusText}`,
      );
    }

    const data = response.data;

    if (process.env.NODE_ENV === "development") {
      console.log("Available courses API response:", data);
      if (data.courses && data.courses.length > 0) {
        console.log(
          "First available course object keys:",
          Object.keys(data.courses[0]),
        );
        console.log("First available course owner info:", {
          ownerId: data.courses[0].ownerId,
          ownerName: data.courses[0].ownerName,
          instructor: data.courses[0].instructor,
          owner: data.courses[0].owner,
          teacher: data.courses[0].teacher,
        });
        console.log("First available course original ID:", data.courses[0].id);
      }
    }

    // Transform the data from the real API format to our UI format
    if (data.courses) {
      // Map the real API response to our AvailableCourse format
      const courses = data.courses.map((course: any) => {
        // Extract teacher name using same approach as teacher page
        const teacherName =
          course.teacher ||
          course.instructor ||
          course.ownerName ||
          (course.owner && course.owner.name) ||
          "Instructor";

        // Process image URL
        let imageUrl = "";
        if (course.coverImage) {
          imageUrl = processImageUrl(course.coverImage);
        } else {
          imageUrl = "/images/course-placeholder.png";
        }

        // Always preserve the original UUID for API calls
        const originalId = course.id;

        // For display purposes we could use a numeric ID, but this isn't required
        // and keeping the original format is safer for API operations
        return {
          id: originalId, // Keep original ID format
          originalId: originalId, // Store the original ID string for API calls
          title: course.name || "Untitled Course",
          instructor: teacherName,
          imageUrl: imageUrl,
          ownerId: course.ownerId, // Include the ownerId for filtering
        };
      });

      if (process.env.NODE_ENV === "development") {
        console.log("Transformed available courses:", courses);
      }

      return courses;
    }

    return data; // Return directly if using local API
  } catch (error: any) {
    // If this is a network error, throw a more specific error to help with retry logic
    if (
      error.message?.includes("fetch failed") ||
      error.message?.includes("network")
    ) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw error; // Rethrow the error for better handling
  }
};

/**
 * Join a course with retry logic for network issues
 * @param courseId - The ID of the course to join
 * @param userId - The ID of the user joining the course
 * @param maxRetries - Maximum number of retry attempts
 */
export const joinCourse = async (
  courseId: number | string,
  userId?: string,
  maxRetries: number = 3,
): Promise<{ success: boolean; message: string }> => {
  let lastError: any = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const endpoint = API_ENDPOINTS.ENROLL_COURSE;

      // Ensure we have a user ID - this is critical for the foreign key constraint
      if (!userId) {
        throw new Error(
          "User ID is required to join a course. No authenticated user ID found.",
        );
      }

      // Ensure the courseId is properly formatted for the API
      // The backend expects a UUID string
      if (!courseId) {
        throw new Error("Course ID is required to join a course.");
      }

      // Check for empty string
      if (typeof courseId === "string" && courseId.trim() === "") {
        throw new Error("Course ID cannot be empty.");
      }

      // Properly format courseId as string
      let apiCourseId: string;
      if (typeof courseId === "number") {
        apiCourseId = courseId.toString();
      } else {
        apiCourseId = courseId;
      }

      // Final validation check before sending
      if (!apiCourseId || apiCourseId.trim() === "") {
        throw new Error(
          "Course ID is empty after processing. Cannot proceed with enrollment.",
        );
      }

      // Create proper payload for API - using snake_case field names
      // This is important since the joinCourse function is called directly
      // and doesn't go through the proxy transformation
      const payload = {
        user_id: userId,
        course_id: apiCourseId,
      };

      const response = await api.post(endpoint, payload);

      if (response.status !== 201) {
        // Try to get more detailed error information
        let errorDetails = "";
        try {
          const errorResponse = response.data;
          errorDetails = JSON.stringify(errorResponse);
        } catch (e) {
          // If we can't parse the response as JSON, use the status text
          errorDetails = response.statusText;
          try {
            // Try to get the raw text
            const errorText = await response.data;
          } catch (textError) {
            // Ignore text parse errors
          }
        }

        // For 5xx errors (server errors), we'll retry
        if (
          response.status >= 500 &&
          response.status < 600 &&
          retryCount < maxRetries
        ) {
          lastError = new Error(
            `Error joining course (${response.status}): ${errorDetails}`,
          );
          retryCount++;
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
          );
          continue;
        }

        throw new Error(
          `Error joining course (${response.status}): ${errorDetails}`,
        );
      }

      const result = response.data;

      return {
        success: true,
        message: "Successfully joined course",
      };
    } catch (error: any) {
      lastError = error;

      // Check if this is a network error that we should retry
      const isNetworkError =
        error.message?.includes("fetch failed") ||
        error.message?.includes("network") ||
        error.message?.includes("socket") ||
        error.cause?.code === "UND_ERR_SOCKET";

      if (isNetworkError && retryCount < maxRetries) {
        retryCount++;
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
        );
        continue;
      }

      // If we've exhausted retries or it's not a retryable error, throw
      throw error;
    }
  }

  // If we've exhausted all retries
  throw lastError || new Error("Failed to join course after multiple attempts");
};

/**
 * Get course progress
 * @param courseId - The ID of the course to get progress for
 */
export const getCourseProgress = async (
  courseId: number,
): Promise<{ progress: number }> => {
  try {
    const endpoint = `/v1/courses/${courseId.toString()}/progress`;

    const response = await api.get(endpoint);

    if (response.status !== 200) {
      throw new Error(`Error fetching course progress: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a course by ID
 * @param courseId - The ID of the course to fetch
 */
export const getCourseById = async (
  courseId: string | number,
): Promise<EnrolledCourse> => {
  try {
    // In a real app, we'd convert the number ID to a string ID for the DB if needed
    const id = typeof courseId === "number" ? courseId.toString() : courseId;

    const endpoint = API_ENDPOINTS.COURSE_DETAIL(id);

    const response = await api.get(endpoint);

    if (response.status !== 200) {
      throw new Error(`Error fetching course details: ${response.statusText}`);
    }

    const data = response.data;

    // Transform the data from the real API format to our UI format
    return {
      id:
        typeof data.id === "string"
          ? parseInt(data.id.replace(/-/g, "").substring(0, 8), 16)
          : data.id,
      title: data.name || "Untitled Course",
      instructor: data.instructor || "Unknown Instructor",
      progress: data.progress || 0,
      imageUrl: processImageUrl(data.coverImage),
    };
  } catch (error) {
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
  coverImage: File,
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("ownerId", ownerId);
    formData.append("coverImage", coverImage);

    const endpoint = API_ENDPOINTS.COURSES;

    const response = await api.post(endpoint, formData);

    if (response.status !== 200) {
      throw new Error(`Error creating course: ${response.statusText}`);
    }

    return await response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a course
 * @param courseId - The ID of the course to update
 * @param courseData - The updated course data
 */
export const updateCourse = async (
  courseId: string,
  courseData: Partial<{ name: string; description: string }>,
): Promise<any> => {
  try {
    const endpoint = API_ENDPOINTS.COURSE_DETAIL(courseId);

    const response = await api.patch(endpoint, courseData);

    if (response.status !== 200) {
      throw new Error(`Error updating course: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a course
 * @param courseId - The ID of the course to delete
 */
export const deleteCourse = async (courseId: string): Promise<any> => {
  try {
    const endpoint = API_ENDPOINTS.COURSE_DETAIL(courseId);

    const response = await api.delete(endpoint);

    if (response.status !== 200) {
      throw new Error(`Error deleting course: ${response.statusText}`);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch user data by user ID
 * This is helpful for getting instructor names from owner IDs
 */
export const getUserById = async (userId: string): Promise<any> => {
  try {
    const endpoint = API_ENDPOINTS.USER_DETAIL(userId);

    const response = await api.get(endpoint);

    if (response.status !== 200) {
      console.log(`Error fetching user data: ${response.statusText}`);
      return null;
    }

    return await response.data;
  } catch (error) {
    console.log("Error fetching user data:", error);
    return null;
  }
};

/**
 * Helper function to try getting an instructor name from owner ID
 */
const getInstructorNameFromOwnerId = async (
  ownerId: string,
): Promise<string> => {
  try {
    const userData = await getUserById(ownerId);
    if (userData && userData.name) {
      return userData.name;
    }
    return `Teacher ${ownerId.substring(0, 8)}`;
  } catch (error) {
    return `Teacher ${ownerId.substring(0, 8)}`;
  }
};
