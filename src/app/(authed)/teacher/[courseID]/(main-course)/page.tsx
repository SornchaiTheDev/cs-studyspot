"use client";
import ChapterBox from "@/components/ChapterBox";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function Chapter() {
  const router = useRouter();
  const { courseID } = useParams();

  const handleOnCreate = () => {
    router.push(`/teacher/${courseID}/create`);
  };

  return (
    <>
      <div className="mt-6 flex w-full justify-between items-center">
        <h3 className="text-2xl font-medium">Chapters</h3>
        <button
          onClick={handleOnCreate}
          className="flex items-center justify-center border border-gray-800 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-2 px-4"
        >
          <Plus />
          <p className="text-lg">Create</p>
        </button>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        <ChapterBox name="01 Intro" path={`/teacher/${courseID}/chapters/1`} />
      </div>
    </>
  );
}
