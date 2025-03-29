"use client";
import {
  File,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";
import Image from "next/image";
interface Props {
  name: string;
  href: string;
}

export default function FilePreview({ name, href }: Props) {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

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

  const isImage = name.match(/\.(jpg|jpeg|png|gif)$/i);

  return (
    <div className="relative group flex flex-col items-center justify-center w-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        <div className="border border-gray-200 rounded-xl w-full aspect-square flex justify-center items-center bg-white hover:bg-gray-50 transition-all duration-300 relative shadow-sm hover:shadow-md group-hover:border-blue-200">
          {isImage ? (
            <div className="relative w-full h-full rounded-xl">
              <Image
                src={href}
                alt={name || "Image preview"}
                className="object-cover"
              />
            </div>
          ) : (
            getFileIcon(name)
          )}
        </div>
        <p className="mt-2 text-xs font-medium text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 w-full px-2 truncate">
          {name.split("/").pop() || "Unnamed file"}
        </p>
      </a>
    </div>
  );
}
