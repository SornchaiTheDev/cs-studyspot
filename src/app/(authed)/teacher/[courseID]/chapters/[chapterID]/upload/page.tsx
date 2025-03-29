"use client";
import Loading from "@/components/Loading";
import LoadingMaterialPreviewCard from "@/components/LoadingMaterialPreviewCard";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import VideoUpload from "@/components/VideoUpload";
import { api } from "@/libs/api";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {toast} from "sonner";
import { useState } from "react";

export default function Upload() {
  const { chapterID, courseID } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: chapter, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<Chapter>(`/v1/chapters/${chapterID}`);
      return res.data;
    },
  });

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<{ materials: Material[] }>(
        `/v1/materials/${chapterID}`
      );
      return res.data.materials;
    },
  });

  const updateChapter = useMutation({
    mutationFn: async ({
      chapterID,
      video_file,
    }: {
      chapterID: string;
      video_file: string;
    }) => {
      const response = await api.patch(`/v1/chapters/${chapterID}`, {
        video_file: video_file,
      });
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.push(`/teacher/${courseID}/chapters/${chapterID}`);
    },
  });

  const handleSave = async (chapterID: string, video_file: string) => {
    if (!video_file) {
      toast.error("Please upload a video first");
      return;
    }
    await updateChapter.mutateAsync({ chapterID, video_file });
    queryClient.invalidateQueries({
      queryKey: ["chapter"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["chapter-course"],
      refetchType: "all",
    });
    queryClient.invalidateQueries({
      queryKey: ["material-chapter"],
      refetchType: "all",
    });
  };

  return (
    <>
      <Loading
        isLoading={isChapterLoading}
        fallback={<Skeleton className="h-8 w-20" />}
      >
        <h4 className="mt-6 text-2xl font-medium">{chapter?.name}</h4>
      </Loading>
      <div className="flex mt-4 gap-6">
        <div className="w-[950px]">
          <VideoUpload
            onUploadSuccess={(url) => {
              setVideoUrl(url);
              setIsUploading(false);
            }}
            onStartUpload={() => setIsUploading(true)}
            initialVideoUrl={chapter?.video_file}
          />
          <button
            onClick={() =>
              handleSave(
                chapterID as string,
                videoUrl || chapter?.video_file || ""
              )
      
            }
            disabled={isUploading || videoUrl === chapter?.video_file}
            className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
          >
            Save
          </button>
          <div className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 w-32 ">
            <h4 className="text-2xl font-medium text-center">Materials</h4>
          </div>
          <div
            className={
              "mt-4 w-full grid grid-cols-6 content-center gap-2 border border-gray-800 p-4 rounded-2xl min-h-44"
            }
          >
            <Loading
              isLoading={getAllMaterialInChapter.isLoading}
              fallback={Array.from({ length: 6 })
                .fill("")
                .map((_, i) => (
                  <LoadingMaterialPreviewCard key={i}/>
                ))}
            >
              {getAllMaterialInChapter.data?.map((material) => (
                <MaterialPreviewCard key={material.id} name={material.file} />
              ))}
            </Loading>
          </div>
        </div>
      </div>
    </>
  );
}
