"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import styles from "./courses.module.css";
import {
  EnrolledCourse,
  AvailableCourse,
  EnrolledCourseCardProps,
  AvailableCourseCardProps,
} from "./types";
import {
  fetchEnrolledCourses,
  fetchAvailableCourses,
  joinCourse,
} from "./services/courseService";
import { useSession } from "@/providers/SessionProvider";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEnrolledCourses, useAvailableCourses, useJoinCourse } from "@/hooks/useCourseQueries";

// Mock data for courses (fallback if API fails)
const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    progress: 78,
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 2,
    title: "Project Manager 2",
    instructor: "Thirawat Kui",
    progress: 45,
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 3,
    title: "Project Manager 3",
    instructor: "Thirawat Kui",
    progress: 92,
    imageUrl: "/images/course-placeholder.png",
  },
];

const mockAvailableCourses: AvailableCourse[] = [
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
  {
    id: 6,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 7,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 8,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 9,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 10,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 11,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
];

// Define a type for the API response with pagination
interface PaginatedCoursesResponse {
  courses: AvailableCourse[];
  pagination: Pagination;
}

interface Pagination {
  page: number;
  total_page: number;
  total_rows: number;
}

// Course card components
const EnrolledCourseCard = ({ course }: EnrolledCourseCardProps) => {
  console.log(course)
  const router = useRouter();
  
  // Get the image URL with a fallback
  const imageUrl = course.imageUrl || "/images/course-placeholder.png";
  
  // Determine if this is an S3 image URL that needs proxying
  const isS3Image = imageUrl.includes('minio-S3') || imageUrl.includes('minio-s3');
  const displayUrl = isS3Image
    ? `/api/proxy/image?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;
  
  const bgImageStyle = isS3Image
    ? { backgroundColor: '#f0f0f0' }
    : { backgroundImage: `url(${displayUrl})` };

  const handleCourseClick = () => {
    router.push(`/courses/${course.id}`);
  };

  // Format the instructor name
  const instructorDisplay = course.instructor || 'Instructor';

  return (
    <div
      className={styles.card}
      style={bgImageStyle}
      onClick={handleCourseClick}
    >
      {isS3Image && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl font-bold bg-gray-100" style={{ zIndex: 0 }}>
          {course.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.infoContainer}>
        <div className={styles.profileRow}>
          <div className={styles.profileInfo}>
            <div className={styles.jobTitle}>{course.title}</div>
            <div className={styles.name}>{instructorDisplay}</div>
          </div>
          <div className={styles.progressLabel}>{course.progress}%</div>
        </div>
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const AvailableCourseCard = ({ course, onJoin }: AvailableCourseCardProps) => {
  const router = useRouter();
  
  // Get the image URL with a fallback
  const imageUrl = course.imageUrl || "/images/course-placeholder.png";
  
  // Determine if this is an S3 image URL that needs proxying
  const isS3Image = imageUrl.includes('minio-S3') || imageUrl.includes('minio-s3');
  const displayUrl = isS3Image
    ? `/api/proxy/image?url=${encodeURIComponent(imageUrl)}`
    : imageUrl;
    
  const bgImageStyle = isS3Image
    ? { backgroundColor: '#f0f0f0' }
    : { backgroundImage: `url(${displayUrl})` };

  const handleCourseClick = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the card click event from firing
    e.stopPropagation();
    
    // Use the original UUID if available, otherwise use the displayed ID
    // Make sure we have a valid ID to use
    const courseIdForApi = course.originalId || course.id;
    
    if (!courseIdForApi) {
      alert('Error: Cannot join this course because no valid course ID is available.');
      return;
    }
    
    // Check for empty string
    if (typeof courseIdForApi === 'string' && courseIdForApi.trim() === '') {
      alert('Error: Cannot join this course because the course ID is empty.');
      return;
    }
    
    // Force toString to ensure we have a valid string for UUID
    const finalCourseId = String(courseIdForApi).trim();
    
    // Call the join function with the course ID
    onJoin(finalCourseId);
  };

  // Format the instructor name
  const instructorDisplay = course.instructor || 'Instructor';

  return (
    <div
      className={styles.card}
      style={bgImageStyle}
      onClick={handleCourseClick}
    >
      {isS3Image && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl font-bold bg-gray-100" style={{ zIndex: 0 }}>
          {course.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={styles.infoContainer}>
        <div className={styles.profileRow}>
          <div className={styles.profileInfo}>
            <div className={styles.jobTitle}>{course.title}</div>
            <div className={styles.name}>{instructorDisplay}</div>
          </div>
          <div 
            className={styles.joinButton}
            onClick={handleJoinClick}
          >
            <div className={styles.buttonText}>Join</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CoursesPage = () => {
  const { user, signOut } = useSession();
  const [userName, setUserName] = useState(user?.name || "User");
  const [imageError, setImageError] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const queryClient = useQueryClient();
  const [visibleCourses, setVisibleCourses] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Use TanStack Query hooks with proper error handling
  const { 
    data: enrolledCourses = [], 
    isLoading: isLoadingEnrolledCourses, 
    error: enrolledError,
    refetch: refetchEnrolledCourses
  } = useEnrolledCourses(user?.id);
  
  const { 
    data: availableCourseData = [], 
    isLoading: isLoadingAvailableCourses,
    error: availableError
  } = useAvailableCourses(page, pageSize);
  
  // Use our custom hook for joining a course
  const { 
    mutate: joinCourseMutate, 
    isPending: isJoining,
    error: joinError
  } = useJoinCourse(user?.id);

  // Combine filtering logic in a useMemo instead of useEffect
  const filteredAvailableCourses = useMemo(() => {
    // Skip filtering if data isn't loaded yet
    if (!availableCourseData) {
      return [];
    }
    
    // Filter out courses that are already in enrolledCourses and courses created by the user
    return availableCourseData.filter((availableCourse) => {
      // Filter out already enrolled courses
      const isEnrolled = enrolledCourses?.some(
        (enrolledCourse) => enrolledCourse.originalId === availableCourse.originalId
      );
      
      // Filter out courses created by the current user - check both ownerId and instructor name
      const isOwner = 
        (user?.id && availableCourse.ownerId === user.id) || 
        (user?.name && availableCourse.instructor === user.name);
      
      // Only include courses that are not enrolled and not owned by the user
      return !isEnrolled && !isOwner;
    });
  }, [availableCourseData, enrolledCourses, user?.id, user?.name]);

  // Determine if there are more courses to load
  const hasMoreCourses = visibleCourses < filteredAvailableCourses.length;
  
  // Create a subset of courses to display based on the current visibility limit
  const visibleAvailableCourses = filteredAvailableCourses.slice(0, visibleCourses);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreCourses) {
          console.log('Loading more available courses...');
          // Increase visible courses by 5
          setVisibleCourses(prev => prev + 5);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreCourses]);

  // Aggregate errors for display
  const error = enrolledError || availableError || joinError;

  // Function to handle joining a course
  const handleJoinCourse = async (courseId: number | string) => {
    // Convert to string to ensure proper format
    const finalCourseId = String(courseId).trim();
    
    // Cache the previous data for potential rollback
    const previousEnrolledCourses = enrolledCourses;
    
    try {
      // Find the course being joined
      const courseToJoin = availableCourseData?.find(
        course => (course.originalId || course.id) === finalCourseId
      );
      
      if (courseToJoin) {
        // Optimistically add to enrolled courses
        const optimisticEnrolledCourse: EnrolledCourse = {
          ...courseToJoin,
          progress: 0, // New courses start at 0% progress
        };
        
        // Update the cache optimistically
        queryClient.setQueryData(
          ['courses', 'enrolled', user?.id],
          (oldData: EnrolledCourse[] = []) => [...oldData, optimisticEnrolledCourse]
        );
        
        // Available courses are now filtered through useMemo, so we don't need to manually update them
        // They will update automatically when the query cache is invalidated
      }
      
      // Call the actual mutation
      joinCourseMutate(finalCourseId, {
        onSuccess: () => {
          // Already handled by the mutation's onSuccess callback
        },
        onError: (error: Error) => {
          // Restore previous data on error
          queryClient.setQueryData(['courses', 'enrolled', user?.id], previousEnrolledCourses);
          
          // Show error message
          alert(`Failed to join course: ${error.message || 'Unknown error'}`);
        }
      });
    } catch (err) {
      // Handle any unexpected errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to join course: ${errorMessage}`);
    }
  };

  // Loading state
  if (isLoadingEnrolledCourses || isLoadingAvailableCourses) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // Show error UI if there's an error
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>
          {error instanceof Error ? error.message : "Failed to load courses. Please try again later."}
        </p>
        <button 
          className={styles.retryButton}
          onClick={() => refetchEnrolledCourses()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeText}>Welcome back!</h1>
          <h2 className={styles.userName}>{userName} <span className={styles.waveEmoji}>👋</span></h2>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.logoutButton}
            onClick={signOut}
          >
            Logout
          </button>
          <div className={styles.profilePicContainer}>
            {!imageError ? (
              <Image 
                src={user?.profileImage || '/images/default-profile.png'} 
                alt="Profile" 
                width={50} 
                height={50} 
                className={styles.profilePic}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.profilePicFallback}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>My enrolled courses</h2>
        {isLoadingEnrolledCourses ? (
          <div className={styles.loadingIndicator}>Loading enrolled courses...</div>
        ) : (
          <div className={styles.courseGrid}>
            {enrolledCourses && enrolledCourses.length > 0 ? (
              enrolledCourses.map((course: EnrolledCourse) => (
                <EnrolledCourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className={styles.emptyMessage}>
                <p>You haven't enrolled in any courses yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Available courses</h2>
        <div className={styles.courseGrid}>
          {isLoadingAvailableCourses ? (
            <div className={styles.loadingIndicator}>Loading available courses...</div>
          ) : filteredAvailableCourses.length > 0 ? (
            <>
              {visibleAvailableCourses.map((course: AvailableCourse) => (
                <AvailableCourseCard 
                  key={course.id} 
                  course={course} 
                  onJoin={handleJoinCourse}
                />
              ))}
              {hasMoreCourses && (
                <div 
                  ref={loadMoreRef} 
                  className={styles.loadMoreTrigger}
                >
                  <div className={styles.loadingSpinner}></div>
                </div>
              )}
            </>
          ) : (
            <p className={styles.emptyMessage}>
              No available courses at the moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage; 
