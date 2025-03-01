// Course types for the student dashboard

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