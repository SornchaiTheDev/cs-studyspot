"use client";
import ChapterBox from "@/components/ChapterBox";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Chapter } from "@/types/chapter";
import { api } from "@/libs/api";
import Loading from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChapterPage() {
  const router = useRouter();
  const { courseID } = useParams();

  const handleOnCreate = () => {
    router.push(`/teacher/${courseID}/create`);
  };

  const getAllChapterInCourse = useQuery({
    queryKey: ["chapter-course", courseID],
    queryFn: async () => {
      const res = await api.get<{ chapters: Chapter[] }>(
        `/v1/chapters/course/${courseID}`
      );
      return res.data.chapters;
    },
  });

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
        <Loading
          isLoading={getAllChapterInCourse.isLoading}
          fallback={Array.from({ length: 12 })
            .fill("")
            .fill("")
            .map((_, i) => (
              <div key={i} className="w-80 h-52 border rounded-2xl">
                <Skeleton className="object-cover rounded-t-2xl w-full h-40" />
                <div className="flex h-12 justify-between items-center py-2 px-2">
                  <Skeleton className="h-7 w-11" />
                  <Skeleton className="border rounded-2xl px-6 h-5 w-20" />
                </div>
              </div>
            ))}
        >
          {getAllChapterInCourse.data?.map((chapter) => (
            <ChapterBox
              key={chapter.id}
              name={chapter.name}
              path={`${chapter.course_id}/chapters/${chapter.id}`}
            />
          ))}
        </Loading>
      </div>
    </>
  );
}
