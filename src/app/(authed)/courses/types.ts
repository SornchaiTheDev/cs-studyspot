export interface BaseCourse {
  id: string | number;
  title: string;
  instructor: string;
  imageUrl: string;
}

export interface EnrolledCourse extends BaseCourse {
  progress: number;
  originalId?: string; // Add original UUID for API calls
}

export interface AvailableCourse extends BaseCourse {
  originalId?: string; // Original UUID for API calls
  ownerId?: string; // Owner ID for filtering out user's own courses
}

// Database schema-aligned types (matching backend)
export interface DBCourse {
  id: string;
  name: string; // maps to title
  coverImage: string; // maps to imageUrl
  description: string;
  ownerId: string; // maps to instructor (via user lookup)
}

export interface DBAttend {
  userId: string;
  courseId: string;
}

export interface DBProgress {
  userId: string;
  courseId: string;
  chapterId: string;
  status: boolean;
}

// Translation functions to convert between DB and UI models
export function translateDBCourseToUI(
  dbCourse: DBCourse,
  instructorName: string,
): BaseCourse {
  return {
    id: parseInt(dbCourse.id), // Convert string ID to number for frontend
    title: dbCourse.name,
    instructor: instructorName, // This would come from a user lookup
    imageUrl: dbCourse.coverImage,
  };
}

export function translateDBCourseToEnrolled(
  dbCourse: DBCourse,
  instructorName: string,
  progress: number,
): EnrolledCourse {
  return {
    ...translateDBCourseToUI(dbCourse, instructorName),
    progress: progress || 0, // Default to 0 if no progress data
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
  onJoin: (id: string | number) => void;
};

