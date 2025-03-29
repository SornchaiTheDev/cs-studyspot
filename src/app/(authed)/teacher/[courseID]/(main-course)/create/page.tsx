"use client";
import { Chapter } from "@/types/chapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {api} from "@/libs/api";

export default function CourseManagement() {
  const [chapterName, setChapterName] = useState("");
  const router = useRouter();
  const { courseID } = useParams();

  const queryClient = useQueryClient();

  const createNewChapter = useMutation({
    mutationFn: async () => {
      const response = await api.post("/v1/chapters", {
        course_id: courseID,
        name: chapterName,
      });
      return response.data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ["chapter-course"] });
      // router.push(`/teacher/${courseID}/chapters/${data.id}`);
    },
  });

  const handleCreate = () => {
    if (!chapterName.trim()) {
      toast.error("Chapter name cannot be empty!");
    } else {
      toast.promise(createNewChapter.mutateAsync, {
        loading: "Creating",
        success: (data:Chapter) => {
          queryClient.invalidateQueries({ queryKey: ["chapter-course"] });
          router.push(`/teacher/${courseID}/chapters/${data.id}`);
          return "Chapter created successfully";
        },
      });
    }
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
        <button
          onClick={handleCreate}
          className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
        >
          {createNewChapter.isPending ? "Creating" : "Create"}
        </button>
      </div>
    </>
  );
}
