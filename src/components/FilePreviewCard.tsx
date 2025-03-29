import { api } from "@/libs/api";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  File,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export interface FilePreviewCardProps {
  file: File;
  filePreview: string;
  index: number;
  isDragged: boolean;
  isDraggedOver: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDelete: (index: number) => void;
  onUploadSuccess: (url: string) => void;
}

export default function FilePreviewCard({
  file,
  filePreview,
  index,
  isDragged,
  isDraggedOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  onUploadSuccess,
}: FilePreviewCardProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/v1/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total!) * 100;
          setUploadProgress(Math.round(progress));
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      onUploadSuccess(data.urls[0]);
    },
  });

  const uploadFileMemo = useMemo(() => uploadFile.mutate, [uploadFile.mutate]);

  useEffect(() => {
    uploadFileMemo(file);
  }, [uploadFileMemo, file]);

  const getFileIcon = (file: File) => {
    if (!file?.name) return <File size={24} className="text-gray-500" />;

    const extension = file.name.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return <FileText size={24} className="text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon size={24} className="text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={24} className="text-green-500" />;
      case "ppt":
      case "pptx":
        return <Presentation size={24} className="text-orange-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
      className={`relative group flex flex-col items-center justify-center transition-all duration-300 ease-out w-full
        ${isDragged ? "opacity-50" : isDraggedOver ? "scale-105" : ""}`}
    >
      <div className="border border-gray-200 rounded-xl w-full aspect-square overflow-hidden flex justify-center items-center bg-white hover:bg-gray-50 transition-all duration-300 relative shadow-sm hover:shadow-md group-hover:border-blue-200">
        {file.type?.startsWith("image/") ? (
          <div className="relative w-full h-full rounded-xl">
          <Image
            src={filePreview}
            alt={file.name || "Image preview"}
            className="object-cover"
            fill
          />
          </div>
        ) : (
          getFileIcon(file)
        )}
        {uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
        <button
          onClick={() => onDelete(index)}
          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110"
        >
          <X size={14} />
        </button>
      </div>
      <p className="mt-2 text-xs font-medium text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 w-full px-2 truncate">
        {file.name || "Unnamed file"}{" "}
        {uploadProgress < 100 && `(${uploadProgress}%)`}
      </p>
    </div>
  );
}
