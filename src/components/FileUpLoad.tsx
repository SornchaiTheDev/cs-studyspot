import { ArrowUpFromLine } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import FilePreviewCard from "./FilePreviewCard";

export type FileWithPreview = {
  file: File | null;
  preview: string;
  id: string;
  url: string;
};

interface Props {
  className?: string;
  files: FileWithPreview[];
  setFiles: Dispatch<SetStateAction<FileWithPreview[]>>;
}
export default function FileUpload({ className, files, setFiles }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      let isError = false;
      acceptedFiles.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          isError = true;
        }
      });

      if (isError) {
        setError("File size must be less than 5MB");
        return;
      }

      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
        url: "",
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setError(null);
    },
    [setFiles],
  );

  const deleteFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up the object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newFiles;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    // Only update if we're dragging over a different position
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newFiles = [...files];
    const [draggedFile] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);

    setFiles(newFiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
    },
  });

  function handleUploadSuccess(url: string, id: string): void {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, url } : file)),
    );
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border border-dashed rounded-lg p-6 transition-all duration-300 ease-in-out cursor-pointer
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
              : "border-gray-300 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
          }`}
      >
        <input {...getInputProps()} />
        <div
          className={`flex flex-col items-center justify-center gap-3 ${className}`}
        >
          <div
            className={`p-2.5 rounded-full transition-all duration-300
              ${
                isDragActive
                  ? "bg-blue-100 scale-110"
                  : "bg-gray-100 group-hover:scale-105"
              }`}
          >
            <ArrowUpFromLine
              className={`transition-colors duration-300
                ${isDragActive ? "text-blue-500" : "text-gray-600"}`}
              size={20}
            />
          </div>
          <div className="text-center">
            <p
              className={`font-medium transition-colors duration-300
                ${isDragActive ? "text-blue-500" : "text-gray-700"}`}
            >
              {isDragActive ? "Drop the files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to select files
            </p>
          </div>
          {className === undefined ? (
            <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Supported formats: JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX, PPT,
              PPTX (up to 5MB)
            </p>
          ) : (
            <p className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              Supported formats:MP3, MP4
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-md">
          <span>⚠️</span> {error}
        </p>
      )}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Uploaded Files
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 w-full">
            {files.map(({ file, id, preview }, index) => (
              <FilePreviewCard
                key={id}
                file={file}
                fileName={file === null ? preview.split("/").pop() : file.name}
                filePreview={preview}
                index={index}
                isDragged={draggedIndex === index}
                isDraggedOver={dragOverIndex === index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDelete={deleteFile}
                onUploadSuccess={(url) => handleUploadSuccess(url, id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
