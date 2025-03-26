"use client";
import ChapterBox from "@/components/ChapterBox";
import { useQueries, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import  {Chapter}  from "@/types/chapter";

export default function ChapterPage() {
  const router = useRouter();
  const { courseID } = useParams();

  const handleOnCreate = () => {
    router.push(`/teacher/${courseID}/create`);
  };

  // const courseID = "0195cdd7-be87-7191-adee-79d2bcb7f49e"

  const getAllChapterInCourse = useQuery({
    queryKey: ["chapter-course",courseID],
    queryFn: async () => {
      const res = await axios.get<{chapters: Chapter[]}>(window.env.API_URL+`/v1/chapters/course/${courseID}`);
      return res.data.chapters;
    }
  })

  return (
    <>
      <div className="mt-6 flex w-full justify-between items-center">
        <h3 className="text-2xl font-medium">Chapters</h3>
        <button
          onClick={handleOnCreate}
          className="flex items-center justify-center border border-gray-800 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-2 px-4 hover:scale-110 hover:bg-gray-300"
        >
          <Plus />
          <p className="text-lg">Create</p>
        </button>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3 gap-y-6">
        {getAllChapterInCourse.data?.map((chapter) => <ChapterBox key={chapter.id} name={chapter.name} path={`${chapter.course_id}/chapters/${chapter.id}`}/>)}
        {/* <ChapterBox name="01 Intro" path={`/teacher/${courseID}/chapters/1`} /> */}
      </div>
    </>
  );
}
