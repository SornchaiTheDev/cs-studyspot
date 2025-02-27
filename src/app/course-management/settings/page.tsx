"use client";
// import BackToPage from "@/app/components/BackToPage";
import MaterialsDetail from "@/app/components/MaterialsDetail";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// interface Props {
//   course: string;
//   teacher: string;
//   chapter: number;
//   student: number;
//   progress: number;
// }

export default function CourseManagement() {
  const courses: Props = {
    course: "Project Manager",
    teacher: "Thirawat Kui",
    chapter: 4,
    student: 12,
    progress: 0,
  };

  const [chapterName, setChapterName] = useState("dafault");

  const router = useRouter();
  const handleSave = () => {
    if (!chapterName.trim()) {
      alert("Chapter name cannot be empty!");
      return;
    }
    router.push("/course-management/settings");
  };

  return (
    <>
      {/* detail in this page */}
      <div className="mt-4 w-1/2 pr-32">
        <h6 className="font-medium">Name</h6>
        <input
          className="w-full mt-3 p-2 rounded-2xl border border-gray-800 focus:ring-0 focus:outline-none"
          placeholder="name of chapter"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
        />
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <div className="mt-6 w-full border border-gray-800 min-h-44 rounded-2xl grid grid-cols-3 auto-cols-max content-center gap-2 p-4">
          <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" />
        </div>
        <button onClick={handleSave} className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10">
          Save
        </button>
        <h4 className="text-2xl font-medium mt-6">Danger Zone</h4>
        <button className="flex items-center gap-3 mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-10 h-10">
          <Trash size={20} />
          <h6 className="font-medium text-lg">Delete Chapter</h6>
        </button>
      </div>
    </>
  );
}
