import { Course } from "./course";

export interface Enrolled {
    courses: Course[];
    userId: string;
}