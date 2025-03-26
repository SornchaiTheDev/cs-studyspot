"use client";
import BackToPage from "@/components/BackToPage";
import { useSession } from "@/providers/SessionProvider";
import { Course } from "@/types/course";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Params } from "next/dist/server/request/params";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

interface Navigation {
  name: string;
  path: (params: Params) => string;
}

interface Props {
  children: ReactNode;
  navigation?: Navigation[];
  backTo: {
    page: string;
    customPath?: string;
  };
}

function TeacherLayout({
  children,
  navigation,
  backTo,
}: Props) {
  const router = useRouter();
  const params = useParams();
  const currentPath = usePathname();

  const {user} = useSession()
  const courseId = "0195cdd7-be87-7191-adee-79d2bcb7f49e";

  const {data:course} = useQuery({
    queryKey: ["course"],
    queryFn: async () => {
      const res = await axios.get<Course>(window.env.API_URL+`/v1/courses/${courseId}`);
      return res.data;
    }
  })

  return (
    <div className="w-screen h-screen p-6 overflow-y-scroll">
      <div className="flex justify-between h-[48px]">
        <BackToPage {...backTo} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/avatar.jpg"
          className="rounded-full border"
          alt="user profile"
        />
      </div>
      <div className="flex gap-8 w-[950px]">
        <div>
          <p className="text-sm">Course</p>
          <h6 className="text-lg font-medium">{course?.name}</h6>
        </div>
        <div>
          <p className="text-sm">Teacher</p>
          <h6 className="text-lg font-medium">{course?.teacher}</h6>
        </div>
        <div>
          <p className="text-sm">Chapter</p>
          <h6 className="text-lg font-medium">{course?.chapterCount}</h6>
        </div>
        <div>
          <p className="text-sm">Student</p>
          <h6 className="text-lg font-medium">{course?.studentCount}</h6>
        </div>
      </div>
      <div className="flex gap-3 mt-3">
        {navigation?.map(({ name, path }) => {
          const _path = path(params);
          const currentPathLastSegment = currentPath.split("/").pop();
          const _pathLastSecment = _path.split("/").pop();
          const isActive = currentPathLastSegment === _pathLastSecment;

          return (
            <button
              key={name}
              onClick={() => {
                router.push(path(params));
              }}
              className={`px-1 flex flex-col items-center ${
                isActive ? "font-medium" : "text-gray-400"
              }`}
            >
              <p>{name}</p>
              {isActive && (
                <div className="w-10 h-0.5 bg-gray-800 rounded-full mt-1"></div>
              )}
            </button>
          );
        })}
      </div>
      <div className="w-full h-0.5 bg-gray-100"></div>
      {children}
    </div>
  );
}

export default TeacherLayout;
