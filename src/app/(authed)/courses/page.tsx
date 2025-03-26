"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [pageSize, setPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    data: enrolledCourses, 
    isLoading: isLoadingEnrolledCourses, 
    refetch: refetchEnrolledCourses,
    error: enrolledError
  } = useEnrolledCourses(user?.id);
  
  const { 
    data: availableCourseData, 
    isLoading: isLoadingAvailableCourses,
    error: availableError,
    refetch: refetchAvailableCourses
  } = useAvailableCourses(page, pageSize);
  
  // Use our custom hook for joining a course
  const { mutate: joinCourseMutate, isPending: isJoining } = useJoinCourse(user?.id);

  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [filteredAvailableCourses, setFilteredAvailableCourses] = useState<AvailableCourse[]>([]);

  // Handle errors from queries
  useEffect(() => {
    if (enrolledError) {
      setError(`Failed to load enrolled courses: ${enrolledError}`);
    } else if (availableError) {
      setError(`Failed to load available courses: ${availableError}`);
    } else {
      setError(null);
    }
  }, [enrolledError, availableError]);

  // Retry loading data
  const handleRetry = useCallback(() => {
    setError(null);
    refetchEnrolledCourses();
    refetchAvailableCourses();
  }, [refetchEnrolledCourses, refetchAvailableCourses]);

  useEffect(() => {
    if (availableCourseData) {
      // Handle different data formats
      let rawAvailableCourses: AvailableCourse[] = [];
      
      if (Array.isArray(availableCourseData)) {
        rawAvailableCourses = availableCourseData;
      } else if (typeof availableCourseData === 'object' && availableCourseData !== null) {
        // Cast to any to handle different response formats
        const data = availableCourseData as any;
        
        if (data.courses && Array.isArray(data.courses)) {
          rawAvailableCourses = data.courses;
        }
      }
      
      setAvailableCourses(rawAvailableCourses);
      
      // Filter out courses that are already in enrolledCourses and courses created by the user
      const filtered = rawAvailableCourses.filter((availableCourse) => {
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
      
      setFilteredAvailableCourses(filtered);
    } else {
      // If available course data is null, set empty arrays to prevent rendering issues
      setAvailableCourses([]);
      setFilteredAvailableCourses([]);
    }
  }, [availableCourseData, enrolledCourses, user?.id, user?.name]);

  // Function to handle joining a course
  const handleJoinCourse = async (courseId: number | string) => {
    try {
      // Don't allow joining if there's already a join operation in progress
      if (isJoining) return;

      if (!user?.id) {
        alert("You must be logged in to join a course");
        return;
      }
      
      // Validate the course ID
      if (!courseId) {
        alert("Cannot join this course due to an invalid course ID");
        return;
      }
      
      // Check for empty string
      if (typeof courseId === 'string' && courseId.trim() === '') {
        alert("Cannot join this course due to an empty course ID");
        return;
      }
      
      joinCourseMutate(courseId, {
        onSuccess: () => {
          // Display success message
          alert("You have successfully joined the course");
          // Refresh enrolled courses data
          refetchEnrolledCourses();
          
          // Set a delayed refetch to ensure the API has time to process the enrollment
          setTimeout(() => {
            refetchEnrolledCourses();
          }, 2000);
        },
        onError: (error: any) => { // Cast error to any for now
          // Display error message
          alert(`Failed to join course: ${error.message || 'Unknown error'}`);
        }
      });
    } catch (err: unknown) {
      // Handle unknown error type
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to join course: ${errorMessage}`);
    }
  };

  // Handle pagination for available courses
  const handlePrevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (pagination && page < pagination.total_page) {
      setPage(prev => prev + 1);
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
          {error || "Failed to load courses. Please try again later."}
        </p>
        <button 
          className={styles.retryButton}
          onClick={handleRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  // Handle both array format and object format with pagination
  let pagination: Pagination | null = null;
  
  if (availableCourseData) {
    if (Array.isArray(availableCourseData)) {
      pagination = {
        page: 1,
        total_page: 1,
        total_rows: availableCourseData.length || 0
      };
    } else if (typeof availableCourseData === 'object' && availableCourseData !== null) {
      // Cast to any to handle different response formats
      const data = availableCourseData as any;
      
      if (data.courses && Array.isArray(data.courses)) {
        pagination = {
          page: data.page || 1,
          total_page: data.total_page || 1,
          total_rows: data.total_data || data.courses.length || 0
        };
      }
    }
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
            filteredAvailableCourses.map((course: AvailableCourse) => (
              <AvailableCourseCard 
                key={course.id} 
                course={course} 
                onJoin={handleJoinCourse}
              />
            ))
          ) : (
            <p className={styles.emptyMessage}>
              No available courses at the moment.
            </p>
          )}
        </div>
        
        {/* Pagination controls */}
        {pagination && (
          <div className={styles.paginationControls}>
            <button 
              className={styles.paginationButton}
              onClick={handlePrevPage}
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {pagination.page} of {pagination.total_page}
            </span>
            <button 
              className={styles.paginationButton}
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.total_page}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage; 
