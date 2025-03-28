import { TeacherCourse } from "../../teacher/services/teacherService";
import { API_ENDPOINTS, useProxyForCORS } from "./courseService";

export interface CourseCreate {
  name: string;
  description: string;
  coverImage: File;
}

export async function createCourse(newCourse: CourseCreate, userId: string): Promise<TeacherCourse> {
  const endpoint = API_ENDPOINTS.PROXY_COURSES;
  
  const formData = new FormData();
  formData.append('name', newCourse.name);
  formData.append('description', newCourse.description);
  formData.append('ownerId', userId);
  formData.append('coverImage', newCourse.coverImage);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (response.status === 409) {
    throw new Error('A course with this name already exists. Please choose a different name.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create course: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getTeacherCourses(userId: string): Promise<TeacherCourse[]> {
  const endpoint = useProxyForCORS()
    ? `${API_ENDPOINTS.PROXY_COURSES}?ownerId=${userId}`
    : `${API_ENDPOINTS.COURSES}?ownerId=${userId}`;

  console.log('Fetching teacher courses for userId:', userId);
  console.log('Using endpoint:', endpoint);

  const response = await fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch teacher courses:', {
      status: response.status,
      error: errorText
    });
    throw new Error(`Failed to fetch teacher courses: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Fetched teacher courses:', data);
  return data;
} 
