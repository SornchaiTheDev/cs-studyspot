"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./teacher.module.css";
import { useSession } from "@/providers/SessionProvider";
import { TeacherCourse, fetchTeacherCourses } from "./services/teacherService";
import { useQuery } from "@tanstack/react-query";

// Course card component
const CourseCard = ({ course, isOwnedByUser }: { 
  course: TeacherCourse, 
  isOwnedByUser?: boolean
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  const handleViewCourse = () => {
    router.push(`/teacher/${course.id}`);
  };

  // Get the image URL from coverImageUrl or imageUrl, with a fallback
  const imageUrl = course.coverImageUrl || course.imageUrl || "/images/course-placeholder.png";
  
  // Check if this is a minio-S3 URL that needs to be proxied
  const getProxiedImageUrl = (url: string) => {
    if (url.includes('minio-S3') || url.includes('minio-s3')) {
      // Use the existing image proxy
      return `/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };
  
  // Use the proxied URL if needed
  const displayUrl = getProxiedImageUrl(imageUrl);
  
  // Log the image URL for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Course ${course.id} image: ${imageUrl} → ${displayUrl}`);
  }
  
  // Determine if we should use a placeholder
  const useImagePlaceholder = !imageUrl || imageError;
  
  // Create a placeholder component to show if image fails to load
  const ImagePlaceholder = () => (
    <div 
      className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-3xl font-bold"
      style={{ height: '149px' }}
    >
      {course.title.charAt(0).toUpperCase()}
    </div>
  );
  
  return (
    <div 
      className={styles.courseCard}
      style={{
        border: isOwnedByUser ? '2px solid #3498db' : '1px solid #000000',
        boxShadow: isOwnedByUser ? '0 4px 8px rgba(52, 152, 219, 0.2)' : 'none',
        position: 'relative'
      }}
    >
      <div className={styles.courseImage}>
        {useImagePlaceholder ? (
          <ImagePlaceholder />
        ) : (
          <Image 
            src={displayUrl} 
            alt={`Cover image for ${course.title}`}
            width={300} 
            height={149}
            style={{ objectFit: "cover" }}
            onError={() => {
              setImageError(true);
            }}
            unoptimized={true}
          />
        )}
      </div>
      <div className={styles.courseInfo}>
        <div className={styles.courseDetails}>
          <h3 className={styles.courseTitle}>
            {course.title}
            {isOwnedByUser && (
              <span style={{ 
                marginLeft: '6px', 
                fontSize: '0.6rem', 
                backgroundColor: '#3498db',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '3px',
                verticalAlign: 'middle'
              }}>
                Mine
              </span>
            )}
          </h3>
          <p className={styles.instructorName}>{course.instructor || 'Instructor'}</p>
        </div>
        <button 
          className={styles.viewButton}
          onClick={handleViewCourse}
        >
          View
        </button>
      </div>
    </div>
  );
};

export default function TeacherPage() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [userName, setUserName] = useState(user?.name || 'User');
  const [imageError, setImageError] = useState(false);
  const [visibleCourses, setVisibleCourses] = useState(10);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Use React Query to fetch courses with proper transformation
  const { data: coursesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['courses', 'teacher', user?.id],
    queryFn: async () => {
      // Use the fetchTeacherCourses function which includes proper data transformation
      return await fetchTeacherCourses(user?.id || '', 1, 1000); // Large pageSize to get all courses
    },
    enabled: !!user?.id,
  });
  
  // Get all courses from the data
  const allCourses = coursesData?.courses || [];
  
  // Determine if there are more courses to load
  const hasMoreCourses = visibleCourses < allCourses.length;
  
  // Create a subset of courses to display based on the current visibility limit
  const teacherCourses = allCourses.slice(0, visibleCourses);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMoreCourses) {
          console.log('Loading more courses...');
          // Increase visible courses by 10
          setVisibleCourses(prev => prev + 10);
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
  
  // Function to handle creating a new course
  const handleCreateCourse = () => {
    router.push("/teacher/create");
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Failed to load courses. Please try again later.</p>
        <button 
          className={styles.retryButton}
          onClick={() => refetch()}
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
            {!imageError && user?.profileImage ? (
              <Image 
                src={user.profileImage} 
                alt={`Profile picture of ${userName}`}
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

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          My courses
        </h2>
        <div className={styles.buttonContainer}>
          <button 
            className={styles.createButton}
            onClick={handleCreateCourse}
          >
            <span className={styles.createButtonText}>
              <span className={styles.plusIcon}>+</span>
              Create
            </span>
          </button>
        </div>
      </div>

      <div className={styles.courseGrid}>
        {teacherCourses.length > 0 ? (
          <>
            {teacherCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isOwnedByUser={course.ownerId === user?.id} 
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
            You haven't created any courses yet.
          </p>
        )}
      </div>
    </div>
  );
} 
