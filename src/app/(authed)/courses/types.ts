// Course types for the student dashboard

// Original frontend types - maintain for UI components
export interface BaseCourse {
  id: number;
  title: string;
  instructor: string;
  imageUrl: string;
}

export interface EnrolledCourse extends BaseCourse {
  progress: number;
}

export interface AvailableCourse extends BaseCourse {
  // Additional properties for available courses can be added here
}

// Database schema-aligned types (matching backend)
export interface DBCourse {
  id: string;
  name: string;            // maps to title
  cover_image: string;     // maps to imageUrl
  description: string;
  owner_id: string;        // maps to instructor (via user lookup)
}

export interface DBAttend {
  user_id: string;
  course_id: string;
}

export interface DBProgress {
  user_id: string;
  course_id: string;
  chapter_id: string;
  status: boolean;
}

// Translation functions to convert between DB and UI models
export function translateDBCourseToUI(dbCourse: DBCourse, instructorName: string): BaseCourse {
  return {
    id: parseInt(dbCourse.id),   // Convert string ID to number for frontend
    title: dbCourse.name,
    instructor: instructorName,  // This would come from a user lookup
    imageUrl: dbCourse.cover_image
  };
}

export function translateDBCourseToEnrolled(
  dbCourse: DBCourse, 
  instructorName: string, 
  progress: number
): EnrolledCourse {
  return {
    ...translateDBCourseToUI(dbCourse, instructorName),
    progress: progress || 0  // Ensure progress defaults to 0 if not provided
  };
}

// Component props types
export type CourseCardProps = {
  course: EnrolledCourse | AvailableCourse;
};

export type EnrolledCourseCardProps = {
  course: EnrolledCourse;
};

export type AvailableCourseCardProps = {
  course: AvailableCourse;
  onJoin: (id: number) => void;
}; 