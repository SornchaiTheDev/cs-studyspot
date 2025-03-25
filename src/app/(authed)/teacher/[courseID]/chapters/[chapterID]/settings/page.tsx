"use client";
import MaterialsDetail from "@/components/MaterialsDetail";
import { Material } from "@/types/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const chapterId = "0195cee8-ab77-7c59-90ca-2c3f5c2b5f7b";
  const router = useRouter();

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", chapterId],
    queryFn: async () => {
      const res = await axios.get<{ materials: Material[] }>(
        window.env.API_URL + `/v1/materials/${chapterId}`
      );
      return res.data.materials;
    },
  });

  const updateChapter = useMutation({
    mutationFn: async ({
      chapterId,
      name,
    }: {
      chapterId: string;
      name: string;
    }) => {
      const response = await axios.patch(
        window.env.API_URL + `/v1/chapters/${chapterId}`,
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
    mutationFn: async (chapterId: string) => {
      const response = await axios.delete(
        window.env.API_URL + `/v1/chapters/${chapterId}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.refresh();
    },
  });

  const handleDelete = async (chapterId: string) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      deleteChapter.mutate(chapterId);
    }
  };

  const handleSave = async (chapterId: string, newName: string) => {
    if (!newName.trim()) {
      setErrorMessage("Chapter name cannot be empty!");
      return;
    }
    setErrorMessage("");
    updateChapter.mutate({ chapterId, name: newName });
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
        <p className="text-sm text-red-500">{errorMessage}</p>
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <div className="mt-6 w-full border border-gray-800 min-h-44 rounded-2xl grid grid-cols-3 auto-cols-max content-center gap-2 p-4">
          {getAllMaterialInChapter.data?.map((material) => (
            <MaterialsDetail key={material.id} name={material.file} />
          ))}
        </div>
        <button
          onClick={() => handleSave(chapterId, chapterName)}
          className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
        >
          Save
        </button>
        <h4 className="text-2xl font-medium mt-6">Danger Zone</h4>
        <button
          onClick={() => handleDelete(chapterId)}
          className="flex items-center gap-3 mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-10 h-10"
        >
          <Trash size={20} />
          <h6 className="font-medium text-lg">Delete Chapter</h6>
        </button>
      </div>
    </>
  );
}
