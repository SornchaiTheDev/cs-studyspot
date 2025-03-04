"use client";
// import BackToPage from "@/app/components/BackToPage";
import MaterialsDetail from "@/app/components/MaterialsDetail";
import { Upload, Video } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useState } from "react";

// interface Props {
//   course: string;
//   teacher: string;
//   chapter: number;
//   student: number;
//   progress: number;
// }

export default function CourseID() {
  // const courses: Props = {
  //   course: "Project Manager",
  //   teacher: "Thirawat Kui",
  //   chapter: 4,
  //   student: 12,
  //   progress: 0,
  // };
  const router = useRouter();
  // const [isChapter, setIsChapter] = useState(true);
  return (
    <>
      {/* detail in this page */}
      <div className="mt-6">
        <h4 className="text-2xl font-medium">01 Intro</h4>
        <h5 className="mt-6 text-lg">Choose Method</h5>
        <div className="flex gap-8 mt-6 items-center">
          <button
            onClick={() => router.push("/course-management/stream")}
            className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-1 hover:bg-gray-200"
          >
            <Video />
            <p className="text-lg">Record</p>
          </button>
          <p>or</p>
          <button
            onClick={() => router.push("/course-management/upload")}
            className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] hover:bg-gray-200"
          >
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
    </>
  );
}
