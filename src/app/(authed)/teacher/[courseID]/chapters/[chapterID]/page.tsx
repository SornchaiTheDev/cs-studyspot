"use client";
import Loading from "@/components/Loading";
import LoadingMaterialPreviewCard from "@/components/LoadingMaterialPreviewCard";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/libs/api";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { useQuery } from "@tanstack/react-query";
import { Upload, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function CourseID() {
  const router = useRouter();
  const { chapterID } = useParams();

  const { data: chapter, isLoading } = useQuery({
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

  return (
    <>
      {/* detail in this page */}
      <div className="mt-6">
        <Loading
          isLoading={isLoading}
          fallback={<Skeleton className="h-8 w-20" />}
        >
          <h4 className="text-2xl font-medium">{chapter?.name}</h4>
        </Loading>
        {chapter?.video_file === "" ? (
          <>
            <h5 className="mt-6 text-lg">Choose Method</h5>
            <div className="flex gap-8 mt-6 items-center">
              <button
                onClick={() => router.push(`${chapterID}/stream`)}
                className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-1 hover:bg-gray-200"
              >
                <Video />
                <p className="text-lg">Record</p>
              </button>
              <p>or</p>
              <button
                onClick={() => router.push(`${chapterID}/upload`)}
                className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] hover:bg-gray-200"
              >
                <Upload />
                <p className="text-lg">Upload</p>
              </button>
            </div>
          </>
        ) : (
          <Loading
            isLoading={isLoading}
            fallback={
              <Skeleton className="w-[950px] h-[530] rounded-lg mt-6" />
            }
          >
            <video
              className="w-[950px] h-[530px] rounded-lg mt-6"
              controls
              src={chapter?.video_file}
            ></video>
          </Loading>
        )}
        <button className="mt-10 border border-gray-800 px-5 h-10 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] bg-gray-200">
          <p className="text-lg">Materials</p>
        </button>
        <div className="mt-6 w-[950px] border border-gray-800 min-h-44 rounded-2xl grid grid-cols-6 content-center gap-2 p-4">
          <Loading
            isLoading={getAllMaterialInChapter.isLoading}
            fallback={Array.from({ length: 6 })
              .fill("")
              .map((_, i) => (
                <LoadingMaterialPreviewCard key={i} />
              ))}
          >
            {getAllMaterialInChapter.data?.map((material) => (
              <MaterialPreviewCard key={material.id} name={material.file} />
            ))}
          </Loading>
        </div>
      </div>
    </>
  );
}
