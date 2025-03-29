"use client";
import { useApi } from "@/hooks/useApi";
import { Chapter } from "@/types/chapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CourseManagement() {
  const [chapterName, setChapterName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { courseID } = useParams();
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const api = useApi();

  const createNewChapter = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post("/v1/chapters", {
        course_id: courseID,
        name: name,
      });
      return response.data;
    },
    onSuccess: (data: Chapter) => {
      queryClient.invalidateQueries({ queryKey: ["chapter-course"] });
      toast({
        description: "Create chapter success.",
      });
      router.push(`/teacher/${courseID}/chapters/${data.id}`);
    },
  });

  const handleCreate = () => {
    if (!chapterName.trim()) {
      setErrorMessage("Chapter name cannot be empty!");
      return;
    }
    setErrorMessage("");
    createNewChapter.mutate(chapterName);
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
        {errorMessage && (
          <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
        )}
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
