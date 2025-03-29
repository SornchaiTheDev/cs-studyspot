"use client";
import { File, FileText, Image as ImageIcon, FileSpreadsheet, Presentation } from "lucide-react";

interface MaterialPreviewCardProps {
  name: string;
  onClick?: () => void;
}

export default function MaterialPreviewCard({ name, onClick }: MaterialPreviewCardProps) {
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

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.open(`${name}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center justify-center transition-all duration-300 ease-out w-full"
    >
      <div className="border border-gray-200 rounded-xl w-full aspect-square overflow-hidden flex justify-center items-center bg-white hover:bg-gray-50 transition-all duration-300 relative shadow-sm hover:shadow-md group-hover:border-blue-200">
        {getFileIcon(name)}
      </div>
      <p className="mt-2 text-xs font-medium text-center text-gray-700 group-hover:text-gray-900 transition-colors duration-300 w-full px-2 truncate">
        {name.split("/").pop()}
      </p>
    </button>
  );
} 