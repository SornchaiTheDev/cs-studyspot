import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTeacherCourses, 
  createCourse, 
  deleteCourse,
  updateCourse,
  CourseCreate
} from '@/app/(authed)/teacher/services/teacherService';
import { 
  fetchEnrolledCourses, 
  fetchAvailableCourses, 
  joinCourse,
  getCourseById
} from '@/app/(authed)/courses/services/courseService';

// Hook for fetching teacher courses
export function useTeacherCourses(userId?: string) {
  return useQuery({
    queryKey: ['teacherCourses', userId],
    queryFn: () => fetchTeacherCourses(userId || 'default-user-id'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId, // Only run if userId is provided
  });
}

// Hook for creating a course
export function useCreateCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseData, userId }: { courseData: CourseCreate; userId: string }) => {
      return createCourse(courseData, userId);
    },
    onSuccess: (_, variables) => {
      // Invalidate teacher courses query to refetch data
      queryClient.invalidateQueries({ queryKey: ['teacherCourses', variables.userId] });
    },
  });
}

// Hook for deleting a course
export function useDeleteCourse(userId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string | number) => deleteCourse(courseId),
    onSuccess: () => {
      // Invalidate teacher courses query to refetch data
      queryClient.invalidateQueries({ queryKey: ['teacherCourses', userId] });
    },
  });
}

// Hook for updating a course
export function useUpdateCourse(userId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, courseData }: { courseId: string | number; courseData: Partial<CourseCreate> }) => {
      return updateCourse(courseId, courseData);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['teacherCourses', userId] });
      queryClient.invalidateQueries({ queryKey: ['course'] }); // Invalidate specific course details
    },
  });
}

// Hook for fetching enrolled courses
export function useEnrolledCourses(userId?: string) {
  return useQuery({
    queryKey: ['enrolledCourses', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const data = await fetchEnrolledCourses(userId);
        return data;
      } catch (error) {
        // Log the error but don't throw, so we can still render the UI
        console.error("Error fetching enrolled courses:", error);
        throw error; // Rethrow so the hook can expose the error
      }
    },
    staleTime: 1000 * 30, // 30 seconds - more aggressive stale time
    refetchInterval: 1000 * 60, // Refetch every minute even if not stale
    refetchOnWindowFocus: true, // Refetch when window gets focus
    retry: 3, // Retry failed requests 3 times
    enabled: !!userId, // Only run if userId is provided
  });
}

// Hook for fetching available courses with pagination
export function useAvailableCourses(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['availableCourses', page, pageSize],
    queryFn: async () => {
      try {
        // Fetch data
        const data = await fetchAvailableCourses(page, pageSize);
        return data;
      } catch (error) {
        // Log the error but throw it for the component to handle
        console.error("Error fetching available courses:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests 2 times
  });
}

// Hook for joining a course
export function useJoinCourse(userId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string | number) => {
      if (!userId) {
        return Promise.reject(new Error('No user ID available. Please log in.'));
      }
      
      // Validate course ID before making the API call
      if (!courseId) {
        return Promise.reject(new Error('Invalid course ID. Cannot join course.'));
      }
      
      // If courseId is a string, validate it's not empty
      if (typeof courseId === 'string' && courseId.trim() === '') {
        return Promise.reject(new Error('Empty course ID. Cannot join course.'));
      }
      
      // Call the API function to join the course
      return joinCourse(courseId, userId);
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      queryClient.invalidateQueries({ queryKey: ['availableCourses'] });
      
      // Then specifically invalidate the user's enrolled courses
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses', userId] });
      
      // Force an immediate refetch
      queryClient.refetchQueries({ queryKey: ['enrolledCourses', userId], exact: true });
      
      // Set a timeout to do another refetch - sometimes API needs time to process the enrollment
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['enrolledCourses', userId], exact: true });
      }, 2000); // 2 second delay
    },
    onError: (error) => {
      // Error handling is handled by the component
    }
  });
}

// Hook for fetching a specific course by ID
export function useCourseById(courseId?: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId || ''),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!courseId, // Only run if courseId is provided
  });
} 