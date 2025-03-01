import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    page: string;
    customPath?: string; // Optional custom path to navigate to
}

export default function BackToPage({page, customPath}: Props) {
    const router = useRouter();
    
    const handleNavigateBack = () => {
        // If a custom path is provided, use that
        if (customPath) {
            router.push(customPath);
            return;
        }
        
        // Default navigation logic
        if (page === "courses") {
            // In course-management context, navigate to teacher
            // We can determine this by checking the current path
            const currentPath = window.location.pathname;
            if (currentPath.includes('course-management')) {
                router.push("/teacher");
            } else {
                // In other contexts, navigate to /courses
                router.push("/courses");
            }
        } else {
            router.push(`/${page}`);
        }
    };
    
    return (
      <div 
        className="flex gap-2 items-center cursor-pointer group"
        onClick={handleNavigateBack}
      >
        <ArrowLeft size={20} />
        <p className="text-lg text-gray-800 group-hover:underline">back to {page}</p>
      </div>  
    );
}