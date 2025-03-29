import { Skeleton } from "./ui/skeleton";

export default function LoadingMaterialPreviewCard() {
  return (
    <div className="group flex flex-col items-center justify-center transition-all duration-300 ease-out w-full">
      <Skeleton className="rounded-xl w-full aspect-square"/>
      <Skeleton className="mt-2 w-full px-2 h-4 " />
    </div>
  );
}
