'use client'
import ChapterBox from "@/app/components/ChapterBox";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Chapter() {
  const router = useRouter();
  return (
    <>
      <div className="mt-6 flex w-full justify-between items-center">
        <h3 className="text-2xl font-medium">Chapters</h3>
        <button onClick={() => router.push("/course-management/create")} className="flex items-center justify-center border border-gray-800 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-2 px-4">
          <Plus/>
          <p className="text-lg">Create</p>
        </button>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        <ChapterBox/>
        <ChapterBox/>
        <ChapterBox/>
        <ChapterBox/>
      </div>
    </>
  );
}
