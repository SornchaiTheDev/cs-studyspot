import { TeacherCourse } from "../../teacher/services/teacherService";
import { API_ENDPOINTS } from "./courseService";
import api, { AxiosError } from "axios";

export interface CourseCreate {
  name: string;
  description: string;
  coverImage: File;
}

export async function createCourse(
  newCourse: CourseCreate,
  userId: string,
): Promise<TeacherCourse> {
  const endpoint = API_ENDPOINTS.COURSES;

  const formData = new FormData();
  formData.append("name", newCourse.name);
  formData.append("description", newCourse.description);
  formData.append("ownerId", userId);
  formData.append("coverImage", newCourse.coverImage);

  try {
    const response = await api.post(endpoint, formData);

    return response.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.status === 409) {
        throw new Error(
          "A course with this name already exists. Please choose a different name.",
        );
      }
      throw new Error(
        `Failed to create course: ${err.status} - ${err.message}`,
      );
    }
    throw new Error("Something went wrong");
  }
}

export async function getTeacherCourses(
  userId: string,
): Promise<TeacherCourse[]> {
  const endpoint = `${API_ENDPOINTS.COURSES}?ownerId=${userId}`;

  console.log("Fetching teacher courses for userId:", userId);
  console.log("Using endpoint:", endpoint);
  try {
    const response = await api.get(endpoint);

    const data = response.data;
    console.log("Fetched teacher courses:", data);
    return data;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error("Failed to fetch teacher courses:", {
        status: err.status,
        error: err.message,
      });
      throw new Error(
        `Failed to fetch teacher courses: ${err.status} - ${err.message}`,
      );
    }
    throw new Error("Something went wrong");
  }
}
