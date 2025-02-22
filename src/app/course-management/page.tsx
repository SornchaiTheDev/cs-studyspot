"use client";
import { useState } from "react";
import BackToPage from "../components/BackToPage";
import FileUpload from "../components/FileUpLoad";

interface Props {
  course: string;
  teacher: string;
  chapter: number;
  student: number;
  progress: number;
}

export default function CourseManagement() {
  const courses: Props = {
    course: "Project Manager",
    teacher: "Thirawat Kui",
    chapter: 4,
    student: 12,
    progress: 0,
  };

  const [isChapter, setIsChapter] = useState(true);
  return (
    <>
      {/* detail in this page */}
      <div className="mt-4 w-1/2 pr-32">
        <h6 className="font-medium">Name</h6>
        <input
          className="w-full mt-3 p-2 rounded-2xl border border-gray-800 focus:ring-0 focus:outline-none"
          placeholder="name of chapter"
        />
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <FileUpload />
        <button className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10">
          Create
        </button>
      </div>
    </>
  );
}
