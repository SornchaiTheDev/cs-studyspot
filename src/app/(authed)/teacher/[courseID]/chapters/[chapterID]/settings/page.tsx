"use client";
import FileUpload from "@/components/FileUpLoad";
import MaterialsDetail from "@/components/MaterialsDetail";
import { useApi } from "@/hooks/useApi";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// interface Props {
//   course: string;
//   teacher: string;
//   chapter: number;
//   student: number;
//   progress: number;
// }

export default function CourseManagement() {
  // const courses: Props = {
  //   course: "Project Manager",
  //   teacher: "Thirawat Kui",
  //   chapter: 4,
  //   student: 12,
  //   progress: 0,
  // };
  const [chapterName, setChapterName] = useState("dafault");
  const [errorMessage, setErrorMessage] = useState("");
  // const chapterID = "0195cee8-ab77-7c59-90ca-2c3f5c2b5f7b";
  const { chapterID, courseID } = useParams();
  const router = useRouter();
  const api = useApi();
  const queryClient = useQueryClient();

  const setMaterialByChapter = useMutation({
    mutationFn: async () => {
      await api.post(`/v1/materials/${chapterID}/set`, {materials: files.map(file => file.url)})
    }
  })

  const getChapterById = useQuery({
    queryKey: ["chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<Chapter>(`/v1/chapters/${chapterID}`
      );
      return res.data;
    },
  });

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
      name,
    }: {
      chapterID: string;
      name: string;
    }) => {
      const response = await api.patch(`/v1/chapters/${chapterID}`,
        {
          name: name,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.refresh();
    },
  });

  const deleteChapter = useMutation({
    mutationFn: async (chapterID: string) => {
      const response = await api.delete(`/v1/chapters/${chapterID}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.refresh();
    },
  });

  const handleDelete = async (chapterID: string) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      await deleteChapter.mutateAsync(chapterID);
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
    }
    router.push(`/teacher/${courseID}`);
  };

  const handleSave = async (chapterID: string, newName: string) => {
    if (!newName.trim()) {
      setErrorMessage("Chapter name cannot be empty!");
      return;
    }
    setErrorMessage("");
    await updateChapter.mutateAsync({ chapterID, name: newName });
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

  useEffect(() => {
    if (getChapterById.data === undefined) return;
    setChapterName(getChapterById.data.name);
  }, [getChapterById.data]);

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
        <p className="text-sm text-red-500">{errorMessage}</p>
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <FileUpload/>
        <div className="mt-6 w-full border border-gray-800 min-h-44 rounded-2xl grid grid-cols-3 auto-cols-max content-center gap-2 p-4">
          {getAllMaterialInChapter.data?.map((material) => (
            <MaterialsDetail key={material.id} name={material.file} />
          ))}
        </div>
        <button
          onClick={() => handleSave(chapterID as string, chapterName)}
          className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
        >
          Save
        </button>
        <h4 className="text-2xl font-medium mt-6">Danger Zone</h4>
        <button
          onClick={() => handleDelete(chapterID as string)}
          className="flex items-center gap-3 mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-10 h-10"
        >
          <Trash size={20} />
          <h6 className="font-medium text-lg">Delete Chapter</h6>
        </button>
      </div>
    </>
  );
}
