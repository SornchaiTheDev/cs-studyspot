"use client";
import BackToPage from "@/app/components/BackToPage";
import MaterialsDetail from "@/app/components/MaterialsDetail";
import { Upload, Video } from "lucide-react";
import { useState } from "react";

interface Props {
  course: string;
  teacher: string;
  chapter: number;
  student: number;
  progress: number;
}

export default function CourseID() {
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
        <img src="/avatar.jpg" className="rounded-full border" />
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
      <div className="mt-6">
        <h4 className="text-2xl font-medium">01 Intro</h4>
        <h5 className="mt-6 text-lg">Choose Method</h5>
        <div className="flex gap-8 mt-6 items-center">
          <button className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-1">
            <Video />
            <p className="text-lg">Record</p>
          </button>
          <p>or</p>
          <button className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)]">
            <Upload />
            <p className="text-lg">Upload</p>
          </button>
        </div>
        <button className="mt-10 border border-gray-800 px-5 h-10 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] bg-gray-200">
          <p className="text-lg">Materials</p>
        </button>
        <div className="mt-6 w-[950px] border border-gray-800 min-h-44 rounded-2xl grid grid-cols-6 content-center gap-2 p-4">
          <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" />
        </div>
      </div>
    </div>
  );
}
