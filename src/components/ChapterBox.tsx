"use client";
import { useRouter } from "next/navigation";

interface Props {
  name: string;
  path: string;
}
export default function ChapterBox({ name, path }: Props) {
  const router = useRouter();
  const handleOnView = () => {
    router.push(path);
  };

  return (
    <div className="w-80 h-52 border border-gray-800 rounded-2xl transition-transform duration-300 ease-out hover:-translate-y-2 will-change-transform">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cover.avif"
        className="object-cover rounded-t-2xl w-full h-40"
        alt="chapter cover image"
      />
      {/* <div className="rounded-t-2xl w-full h-40 bg-gradient-to-b from-gray-500 to-gray-300"></div> */}

      <div className="flex h-12 justify-between items-center py-2 px-2">
        <h6 className="text-md font-medium">{name}</h6>
        <button
          onClick={handleOnView}
          className="border rounded-2xl px-6 border-gray-800 text-sm hover:bg-gray-300 hover:scale-105"
        >
          View
        </button>
      </div>
    </div>
  );
}
