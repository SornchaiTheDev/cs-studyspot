import { ArrowLeft } from "lucide-react";

interface Props {
    page: string;
}

export default function BackToPage({page}: Props) {
    return (
      <div className="flex gap-2 items-center">
        <ArrowLeft size={20} />
        <p className="text-lg text-gray-800">back to {page}</p>
      </div>  
    );
}