"use client";
import { ArrowUpFromLine, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function FileUpload() {
  const [file, setFile] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    let isError = false;
    acceptedFiles.map((file) => {
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          isError = true;
          return;
        }
      }
    });
    if (isError) {
      setError("File size must be less than 5MB");
      return;
    }
    setFile((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  return (
    <div className="flex flex-col items-center px-6 py-10 border border-gray-800 rounded-lg cursor-pointer w-full">
      <div
        {...getRootProps()}
        className="w-full text-center p-4 flex flex-col items-center justify-center gap-4"
      >
        <input {...getInputProps()} />
        <ArrowUpFromLine className="text-gray-600" size={24} />
        <p className="text-gray-600 font-medium">
          Choose a file or drag & drop it here
        </p>
        <p className="text-sm text-gray-500">
          JPG,JPEG,PNG formats, up to 5mbs
        </p>
      </div>

      {file.map((item) => (
        <div className="mt-4">
          <img
            src={URL.createObjectURL(item)}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md"
          />
          <p className="text-sm text-gray-700 mt-2">{item.name}</p>
        </div>
      ))}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
