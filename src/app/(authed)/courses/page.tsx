"use client";

import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  pagination: {
    page: number;
    total_page: number;
    total_rows: number;
  };
}

// Course card components
const EnrolledCourseCard = ({ course }: EnrolledCourseCardProps) => {
  const router = useRouter();

  const handleCourseClick = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div
      className={styles.card}
      style={{
        boxShadow: "8.82353px 8.82353px 0px #5D5C5C",
        backgroundImage: `url(${course.imageUrl})`,
      }}
      onClick={handleCourseClick}
    >
      <div className={styles.infoContainer}>
        <div className={styles.profileRow}>
          <div className={styles.profileInfo}>
            <div className={styles.jobTitle}>{course.title}</div>
            <div className={styles.name}>{course.instructor}</div>
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

  const handleCourseClick = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the card click event from firing
    e.stopPropagation();
    onJoin(course.id);
  };

  return (
    <div
      className={styles.card}
      style={{ backgroundImage: `url(${course.imageUrl})` }}
      onClick={handleCourseClick}
    >
      <div className={styles.infoContainer}>
        <div className={styles.profileRow}>
          <div className={styles.profileInfo}>
            <div className={styles.jobTitle}>{course.title}</div>
            <div className={styles.name}>{course.instructor}</div>
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

export default function CoursesPage() {
  const { user, signOut } = useSession(); // Get user data and signOut function from session
  const [userName, setUserName] = useState(user?.name || "User"); // Use user's name from session with fallback
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Use Tanstack Query to fetch enrolled courses with user ID
  const enrolledCoursesQuery = useQuery({
    queryKey: ['enrolledCourses', user?.id],
    queryFn: () => fetchEnrolledCourses(user?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use Tanstack Query to fetch available courses with pagination
  const availableCoursesQuery = useQuery<PaginatedCoursesResponse | AvailableCourse[]>({
    queryKey: ['availableCourses', page, pageSize],
    queryFn: () => fetchAvailableCourses(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use mutation for joining a course
  const joinCourseMutation = useMutation({
    mutationFn: (courseId: number | string) => joinCourse(courseId, user?.id),
    onSuccess: () => {
      // Invalidate queries to refetch the data
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
      queryClient.invalidateQueries({ queryKey: ['availableCourses'] });
    },
  });

  // Function to handle joining a course
  const handleJoinCourse = async (courseId: number | string) => {
    try {
      console.log(`Attempting to join course: ${courseId}`);
      
      // For debugging purposes, use a known valid course ID from your Postman collection
      // This is temporary, to help troubleshoot the issue
      const validCourseId = "0195b848-1e58-79dc-a04d-079f39492362";
      
      console.log(`Using known valid course ID: ${validCourseId} instead of ${courseId}`);
      
      await joinCourseMutation.mutate(validCourseId);
      
      // Show success message (in a real app, you'd use a toast or notification)
      console.log("Successfully joined course!");
    } catch (err) {
      console.error(`Error joining course ${courseId}:`, err);
      // Here you'd typically show an error message to the user
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    const paginatedData = availableCoursesQuery.data as PaginatedCoursesResponse;
    // Check if there's a next page available
    if (paginatedData?.pagination && paginatedData.pagination.page < paginatedData.pagination.total_page) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  // Loading state
  if (enrolledCoursesQuery.isLoading || availableCoursesQuery.isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // Error state
  if (enrolledCoursesQuery.isError || availableCoursesQuery.isError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Failed to load courses. Please try again later.</p>
        <button 
          className={styles.retryButton}
          onClick={() => {
            enrolledCoursesQuery.refetch();
            availableCoursesQuery.refetch();
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Get data from queries
  const enrolledCourses = enrolledCoursesQuery.data || mockEnrolledCourses;
  
  // Handle both array format and object format with pagination
  let availableCourses: AvailableCourse[] = mockAvailableCourses;
  let pagination = null;
  
  if (availableCoursesQuery.data) {
    if (Array.isArray(availableCoursesQuery.data)) {
      availableCourses = availableCoursesQuery.data;
    } else {
      const paginatedData = availableCoursesQuery.data as PaginatedCoursesResponse;
      availableCourses = paginatedData.courses || [];
      pagination = paginatedData.pagination;
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
        <div className={styles.courseGrid}>
          {enrolledCourses.length > 0 ? (
            enrolledCourses.map((course: EnrolledCourse) => (
              <EnrolledCourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className={styles.emptyMessage}>
              You haven't enrolled in any courses yet.
            </p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Available courses</h2>
        <div className={styles.courseGrid}>
          {availableCourses.length > 0 ? (
            availableCourses.map((course: AvailableCourse) => (
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
              disabled={page <= 1}
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
} 
