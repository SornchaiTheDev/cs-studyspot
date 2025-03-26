"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./teacher.module.css";
import { useSession } from "@/providers/SessionProvider";
import { TeacherCourse } from "./services/teacherService";
import { useTeacherCourses } from "@/hooks/useCourseQueries";

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
            alt={course.title} 
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

  // Use Tanstack Query to fetch teacher courses
  const { data: allTeacherCourses = [], isLoading, isError, refetch } = useTeacherCourses(
    user?.id || 'default-user-id'
  );
  
  // Filter to only show user's courses
  const teacherCourses = allTeacherCourses.filter(course => {
    // Check if the course is owned by the current user
    const isOwned = course.ownerId === user?.id;
    
    // Check if the course has the user as instructor/teacher
    const isTeaching = 
      course.instructor?.includes(user?.name || '') || 
      (user?.name && course.teacher?.includes(user.name));
    
    // Include if either condition is true
    return isOwned || isTeaching;
  });
  
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
          teacherCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isOwnedByUser={course.ownerId === user?.id} 
            />
          ))
        ) : (
          <p className={styles.emptyMessage}>
            You haven't created any courses yet.
          </p>
        )}
      </div>
    </div>
  );
} 
