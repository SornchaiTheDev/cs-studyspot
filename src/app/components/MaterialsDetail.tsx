'use client'
import {File} from "lucide-react"

interface Props {
    name: string;
}

export default function MaterialsDetail({name}: Props) {
  return (
    <div className="flex-col justify-center items-center">
      <div className="border border-gray-800 rounded-2xl w-36 h-32 flex justify-center items-center">
        <File size={16} />
      </div>
      <p className="mt-1 text-sm font-medium text-center">{name}</p>
    </div>
  );
}
