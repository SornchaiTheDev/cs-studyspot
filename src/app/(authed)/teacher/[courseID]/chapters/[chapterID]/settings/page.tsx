"use client";
import DialogComp from "@/components/DialogComp";
import FileUpload, { FileWithPreview } from "@/components/FileUpLoad";
import Loading from "@/components/Loading";
import LoadingMaterialPreviewCard from "@/components/LoadingMaterialPreviewCard";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import { api } from "@/libs/api";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { Dialog } from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash, Upload, Video } from "lucide-react";
import Loadable from "next/dist/shared/lib/loadable.shared-runtime";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CourseManagement() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const urls = files.map((file) => file.url);
  const [chapterName, setChapterName] = useState("loading...");
  const [errorMessage, setErrorMessage] = useState("");
  const { chapterID, courseID } = useParams();
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  const setMaterialByChapter = useMutation({
    mutationFn: async () => {
      await api.post(`/v1/materials/${chapterID}/set`, {
        materials: files.map((file) => file.url),
      });
    },
  });

  const getChapterById = useQuery({
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
      name,
    }: {
      chapterID: string;
      name: string;
    }) => {
      const response = await api.patch(`/v1/chapters/${chapterID}`, {
        name: name,
      });
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.refresh();
    },
  });

  const deleteChapter = useMutation({
    mutationFn: async (chapterID: string) => {
      const response = await api.delete(`/v1/chapters/${chapterID}`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh the page or update the chapters list
      router.refresh();
    },
  });

  const handleDelete = async (chapterID: string) => {
    // if (window.confirm("Are you sure you want to delete this chapter?")) {
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
    router.push(`/teacher/${courseID}`);
  };

  const handleSave = async (chapterID: string, newName: string) => {
    if (!newName.trim()) {
      setErrorMessage("Chapter name cannot be empty!");
      return;
    }
    setErrorMessage("");
    await updateChapter.mutateAsync({ chapterID, name: newName });
    if (urls.length > 0) {
      await setMaterialByChapter.mutateAsync();
    }

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
    setFiles([]);
  };

  useEffect(() => {
    if (getChapterById.data === undefined) return;
    setChapterName(getChapterById.data.name);
  }, [getChapterById.data]);

  const isEdited =
    chapterName !== getChapterById.data?.name ||
    (urls.length > 0 && urls.every((url) => url !== ""));

  const isUploading = urls.length > 0 && urls.some((url) => url === "");

  return (
    <>
      {/* detail in this page */}

      <div className="mt-4 w-1/2 pr-32">
        <h6 className="font-medium">Name</h6>
        <input
          disabled={getChapterById.isLoading}
          className="w-full mt-3 p-2 rounded-2xl border border-gray-800 focus:ring-0 focus:outline-none"
          placeholder="name of chapter"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
        />
        <p className="text-sm text-red-500">{errorMessage}</p>
        <h5 className="font-medium mt-6 mb-6">Edit Method</h5>
        <div className="flex gap-8 mt-6 items-center">
          <button
            onClick={() =>
              router.push(`/teacher/${courseID}/chapters/${chapterID}/stream`)
            }
            className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-1 hover:bg-gray-200"
          >
            <Video />
            <p className="text-lg">Record</p>
          </button>
          <p>or</p>
          <button
            onClick={() =>
              router.push(`/teacher/${courseID}/chapters/${chapterID}/upload`)
            }
            className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] hover:bg-gray-200"
          >
            <Upload />
            <p className="text-lg">Upload</p>
          </button>
        </div>
        <h6 className="font-medium mt-6 mb-6">Materials</h6>
        <FileUpload files={files} setFiles={setFiles} />
        <div className="mt-6 w-full border border-gray-800 min-h-44 rounded-2xl grid grid-cols-3 auto-cols-max content-center gap-2 p-4">
          {getAllMaterialInChapter.data?.map((material) => (
            <Loading
              key={material.id}
              isLoading={getAllMaterialInChapter.isLoading}
              fallback={<LoadingMaterialPreviewCard />}
            >
              <MaterialPreviewCard name={material.file} />
            </Loading>
          ))}
        </div>
        <button
          disabled={!isEdited}
          onClick={() => handleSave(chapterID as string, chapterName)}
          className="w-full mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-10"
        >
          {isUploading
            ? "Uploading..."
            : setMaterialByChapter.isPending || updateChapter.isPending
            ? "Saving"
            : "Save"}
        </button>
        <h4 className="text-2xl font-medium mt-6">Danger Zone</h4>
        <DialogComp
          buttonName={"Delete Chapter"}
          topic={"Delete this chapter?"}
          description={`Are you sure to delete ${getChapterById.data?.name} chapter,`}
          icon={<Trash size={20} />}
          onAcceptState={() => {
            handleDelete(chapterID as string);
          }}
        />
        {/* <button
          onClick={() => handleDelete(chapterID as string)}
          className="flex items-center gap-3 mt-6 border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-10 h-10"
        >
          <Trash size={20} />
          <h6 className="font-medium text-lg">Delete Chapter</h6>
        </button> */}
      </div>
    </>
  );
}
