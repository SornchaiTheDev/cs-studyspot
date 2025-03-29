"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { api } from "@/libs/api";
import {toast} from "sonner"


interface FileWithPreview extends File {
  preview: string;
}

interface UploadResponse {
  urls: string[];
}

interface Props {
  onUploadSuccess?: (url: string) => void;
  initialVideoUrl?: string;
  onStartUpload: () => void;
}

export default function VideoUpload({
  onUploadSuccess,
  initialVideoUrl,
  onStartUpload,
}: Props) {
  const [video, setVideo] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | undefined>(
    initialVideoUrl,
  );
  const [isHovering, setIsHovering] = useState(false);

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<UploadResponse>("/v1/upload-file", formData, {
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
      setCurrentVideoUrl(data.urls[0]);
      onUploadSuccess?.(data.urls[0]);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const videoFile = acceptedFiles[0];

      if (videoFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }

      if (videoFile.type !== "video/mp4") {
        setError("Only MP4 format is supported");
        return;
      }

      const newFile = {
        ...videoFile,
        preview: URL.createObjectURL(videoFile),
      };

      setVideo(newFile);
      setError(null);
      onStartUpload();
      toast.promise(uploadFile.mutateAsync(videoFile), {
        loading: "Uploading",
        success: () => {
          return "Video uploaded success"
        }
      })
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/mp4": [".mp4"] },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`border border-dashed rounded-lg p-6 transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center aspect-video relative
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
              : "border-gray-300 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
          }`}
      >
        <input {...getInputProps()} />
        {video ? (
          <div className="w-full h-full relative">
            <video
              src={video.preview}
              controls
              className="w-full h-full object-cover rounded-lg"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-200 h-1">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {isHovering && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Upload size={40} className="mx-auto mb-2" />
                  <p className="text-sm">Click or drag to replace video</p>
                </div>
              </div>
            )}
          </div>
        ) : currentVideoUrl ? (
          <div className="w-full h-full relative">
            <video
              src={currentVideoUrl}
              controls
              className="w-full h-full object-cover rounded-lg"
            />
            {isHovering && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Upload size={40} className="mx-auto mb-2" />
                  <p className="text-sm">Click or drag to replace video</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p
              className={`font-medium transition-colors duration-300
                ${isDragActive ? "text-blue-500" : "text-gray-700"}`}
            >
              {isDragActive
                ? "Drop the video here"
                : "Click or drag to upload MP4"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported format: MP4 (up to 50MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-2 bg-red-50 px-3 py-1.5 rounded-md">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
