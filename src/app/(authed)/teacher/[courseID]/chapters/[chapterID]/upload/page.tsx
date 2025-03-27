"use client"
import FileUpload from "@/components/FileUpLoad";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import VideoUpload from "@/components/VideoUpload";
import { useApi } from "@/hooks/useApi";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function Upload() {
  const {chapterID, courseID} = useParams();
  const api = useApi();
  const router = useRouter()
  const queryClient = useQueryClient();
  const [videoUrl, setVideoUrl] = useState<string>("");

  const {data:chapter} = useQuery({
    queryKey: ["chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<Chapter>(`/v1/chapters/${chapterID}`);
      return res.data;
    }
  })
  
  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<{ materials: Material[] }>(`/v1/materials/${chapterID}`
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
      const response = await api.patch(`/v1/chapters/${chapterID}`,
        {
          video_file: video_file,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.push(`/teacher/${courseID}/chapters/${chapterID}`);
    },
  });

  const handleSave = async (chapterID: string, video_file: string) => {
    if (!video_file) {
      alert("Please upload a video first");
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
      <h4 className="mt-6 text-2xl font-medium">{chapter?.name}</h4>
      <div className="flex mt-4 gap-6">
        <div className="w-[950px]">
          <VideoUpload 
            onUploadSuccess={(url) => {
              setVideoUrl(url);
            }}
            initialVideoUrl={chapter?.video_file}
          />
          <button
            onClick={() => handleSave(chapterID as string, videoUrl || chapter?.video_file || "")}
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
            {getAllMaterialInChapter.data?.map((material) => (
              <MaterialPreviewCard key={material.id} name={material.file}/>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
