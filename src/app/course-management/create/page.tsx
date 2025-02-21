"use client";
import BackToPage from "@/app/components/BackToPage";
import FileUpload from "@/app/components/FileUpLoad";
import { useState } from "react";



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
    <div className="w-screen h-screen p-6 overflow-y-scroll">
      <div className="flex justify-between h-[48px]">
        <BackToPage page="courses" />
        <img src="avatar.jpg" className="rounded-full border" />
      </div>
      <div className="flex gap-8 w-[950px]">
        <div>
          <p className="text-sm">Course</p>
          <h6 className="text-lg font-medium">{courses.course}</h6>
        </div>
        <div>
          <p className="text-sm">Teacher</p>
          <h6 className="text-lg font-medium">{courses.teacher}</h6>
        </div>
        <div>
          <p className="text-sm">Chapter</p>
          <h6 className="text-lg font-medium">{courses.chapter}</h6>
        </div>
        <div>
          <p className="text-sm">Student</p>
          <h6 className="text-lg font-medium">{courses.student}</h6>
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => setIsChapter(true)}
          className={`px-1 flex flex-col items-center ${
            isChapter ? "font-medium" : "text-gray-400"
          }`}
        >
          <p>Chapters</p>
          {isChapter ? (
            <div className="w-10 h-0.5 bg-gray-800 rounded-full mt-1"></div>
          ) : (
            <></>
          )}
        </button>
        <button
          onClick={() => setIsChapter(false)}
          className={`px-1 flex flex-col items-center ${
            isChapter ? "text-gray-400" : "font-medium"
          }`}
        >
          <p>Settings</p>
          {isChapter ? (
            <></>
          ) : (
            <div className="w-10 h-0.5 bg-gray-800 rounded-full mt-1"></div>
          )}
        </button>
      </div>
      <div className="w-full h-0.5 bg-gray-100"></div>

      {/* detail in this page */}
      <div className="mt-4 w-1/2 pr-32">
        <h6 className="font-medium">Name</h6>
        <input className="w-full mt-3 p-2 rounded-2xl border border-gray-800 focus:ring-0 focus:outline-none" placeholder="name of chapter"/>
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <FileUpload/>
        <button className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10">
            Create
          </button>
      </div>
    </div>
  );
}
