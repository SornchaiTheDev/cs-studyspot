"use client";
// import { useState } from "react";
// import BackToPage from "../components/BackToPage";
// import FileUpload from "../components/FileUpLoad";
import { useRouter } from "next/navigation";

// interface Props {
//   course: string;
//   teacher: string;
//   chapter: number;
//   student: number;
//   progress: number;
// }

export default function CourseManagement() {
  // const courses: Props = {
  //   course: "Project Manager",
  //   teacher: "Thirawat Kui",
  //   chapter: 4,
  //   student: 12,
  //   progress: 0,
  // };
  //
  // const [isChapter, setIsChapter] = useState(true);
  const router = useRouter();
  return (
    <>
      {/* detail in this page */}
      <div className="w-full mt-72 flex flex-col justify-center items-center">
        <h6 className="font-medium">Course Management Page</h6>
        <button
          onClick={() => router.push("/course-management/chapter")}
          className="mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
        >
          View Chapter
        </button>
      </div>
    </>
  );
}
