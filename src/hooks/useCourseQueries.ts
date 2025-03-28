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
import { EnrolledCourse, AvailableCourse } from '@/app/(authed)/courses/types';

// Define key factory for better type safety and consistency
export const courseKeys = {
  all: ['courses'] as const,
  enrolled: (userId?: string) => 
    [...courseKeys.all, 'enrolled', userId] as const,
  available: (params?: { page?: number; pageSize?: number }) => 
    [...courseKeys.all, 'available', params] as const,
  teacher: (userId?: string) => 
    [...courseKeys.all, 'teacher', userId] as const,
  detail: (courseId?: string) => 
    [...courseKeys.all, 'detail', courseId] as const,
};

// Hook for fetching teacher courses
export function useTeacherCourses(userId?: string) {
  return useQuery({
    queryKey: courseKeys.teacher(userId),
    queryFn: () => fetchTeacherCourses(userId || ''),
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
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher(variables.userId) });
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
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher(userId) });
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
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: courseKeys.teacher(userId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(String(variables.courseId)) });
    },
  });
}

// Hook for fetching enrolled courses
export function useEnrolledCourses(userId?: string) {
  return useQuery<EnrolledCourse[], Error>({
    queryKey: courseKeys.enrolled(userId),
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        return await fetchEnrolledCourses(userId);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        throw error instanceof Error 
          ? error 
          : new Error(String(error));
      }
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    enabled: !!userId,
  });
}

// Hook for fetching available courses with pagination
export function useAvailableCourses(page: number = 1, pageSize: number = 10) {
  return useQuery<AvailableCourse[], Error>({
    queryKey: courseKeys.available({ page, pageSize }),
    queryFn: async () => {
      try {
        return await fetchAvailableCourses(page, pageSize);
      } catch (error) {
        console.error("Error fetching available courses:", error);
        throw error instanceof Error 
          ? error 
          : new Error(String(error));
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data when loading new page
  });
}

// Hook for joining a course
export function useJoinCourse(userId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courseId: string | number) => {
      if (!userId) {
        throw new Error('No user ID available. Please log in.');
      }
      
      if (!courseId) {
        throw new Error('Invalid course ID. Cannot join course.');
      }
      
      if (typeof courseId === 'string' && courseId.trim() === '') {
        throw new Error('Empty course ID. Cannot join course.');
      }
      
      return joinCourse(courseId, userId);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: courseKeys.enrolled(userId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.available() });
      
      // Set a timeout to do another refetch after a delay
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: courseKeys.enrolled(userId) });
      }, 2000);
    },
  });
}

// Hook for fetching a specific course by ID
export function useCourseById(courseId?: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourseById(courseId || ''),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!courseId,
  });
} 
