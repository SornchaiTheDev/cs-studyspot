// Define types for teacher courses
export interface TeacherCourse {
  id: number;
  title: string;
  instructor: string;
  imageUrl: string;
}

// Mock data for teacher courses
const mockTeacherCourses: TeacherCourse[] = [
  {
    id: 1,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 2,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
  {
    id: 3,
    title: "Project Manager",
    instructor: "Thirawat Kui",
    imageUrl: "/images/course-placeholder.png",
  },
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
];

/**
 * Fetch courses created by the teacher
 * @returns Promise<TeacherCourse[]>
 */
export const fetchTeacherCourses = async (): Promise<TeacherCourse[]> => {
  // In a real app, this would be an API call
  // For example:
  // const response = await fetch('/api/teacher/courses');
  // const data = await response.json();
  // return data;
  
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTeacherCourses);
    }, 500);
  });
};

/**
 * Create a new course
 * @param courseData Course data to create
 * @returns Promise<TeacherCourse>
 */
export const createCourse = async (courseData: Omit<TeacherCourse, 'id'>): Promise<TeacherCourse> => {
  // In a real app, this would be an API call
  // For example:
  // const response = await fetch('/api/teacher/courses', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(courseData),
  // });
  // const data = await response.json();
  // return data;
  
  // For now, return mock data with a new ID
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000) + 10, // Generate a random ID
        ...courseData,
      });
    }, 500);
  });
};

/**
 * Delete a course
 * @param courseId ID of the course to delete
 * @returns Promise<void>
 */
export const deleteCourse = async (courseId: number): Promise<void> => {
  // In a real app, this would be an API call
  // For example:
  // await fetch(`/api/teacher/courses/${courseId}`, {
  //   method: 'DELETE',
  // });
  
  // For now, just return a resolved promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}; 