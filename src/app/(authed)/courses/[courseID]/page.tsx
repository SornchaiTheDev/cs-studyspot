"use client";
import BackToPage from "@/components/BackToPage";
import ChapterSelected from "@/components/ChapterSelected";
import MaterialsDetail from "@/components/MaterialsDetail";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Course } from "@/types/course";
import { Enrolled } from "@/types/enrolled";
import { Material } from "@/types/material";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/providers/SessionProvider";
import { Chapter } from "@/types/chapter";

interface Props {
  course: string;
  teacher: string;
  chapter: number;
  student: number;
  progress: number;
}

export default function CoursePage() {
  const [isOverview, setIsOverview] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  // const [currentChapter, setCurrentChapter] = useState(1);
  const courseId = "0195cdd7-be87-7191-adee-79d2bcb7f49e";
  const { user } = useSession();
  console.log(user.id)


  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleVideoEnd = (event: Event) => {
        console.log(
          "Video stopped either because it has finished playing or no further data is available."
        );
      };

      video.addEventListener("ended", handleVideoEnd);

      return () => {
        video.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, []);

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await axios.get<Course>(
        window.env.API_URL + `/v1/courses/${courseId}`
      );
      return res.data;
    },
  });

  const joinCourse = useMutation({
    mutationFn: async () => {
      await axios.post(window.env.API_URL + `/v1/attend/enroll`, {
        user_id: user.id,
        course_id: course?.id,
      });
    },
  });

  const getAllCourseOfUser = useQuery({
    queryKey: ["user-courses", user.id],
    queryFn: async () => {
      const res = await axios.get<Enrolled>(
        window.env.API_URL + `/v1/attend/user/${user.id}`
      );
      return res.data;
    },
  });

  const getAllChapterInCourse = useQuery({
    queryKey: ["chapters", courseId],
    queryFn: async () => {
      const res = await axios.get<{ chapters: Chapter[] }>(
        window.env.API_URL + `/v1/chapters/course/${courseId}`
      );
      return res.data.chapters;
    },
  });

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", activeChapter],
    queryFn: async () => {
      const res = await axios.get<{ materials: Material[] }>(
        window.env.API_URL + `/v1/materials/${activeChapter?.id}`
      );
      return res.data.materials;
    },
  });

  const getProgress = useQuery({
    queryKey: ["progress-user-course"],
    queryFn: async () => {
      const res = await axios.get(window.env.API_URL+ `/v1/progress/percentage?userId=${user.id}&courseId=${course?.id}`);
      return res.data
    }
  })

  useEffect(() => {
    if (getAllChapterInCourse.data === undefined) return;
    else if (getAllChapterInCourse.data.length === 0) return;
    setActiveChapter(getAllChapterInCourse.data[0]);
  }, [getAllChapterInCourse.data]);

  return (
    <div className="w-screen h-screen p-6 overflow-y-scroll">
      <div className="flex justify-between h-[48px]">
        <BackToPage page="courses" customPath="/courses" />
        <img src={user.profileImage} className="rounded-full border" />
      </div>
      <div className="w-[950px]">
        <div className="flex justify-between w-full items-end">
          <div className="flex gap-8">
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
              <p className="text-sm">Progress</p>
              <h6 className="text-lg font-medium">{0} %</h6>
            </div>
          </div>
          {getAllCourseOfUser.data?.courses.find(
            (course) => course.id === courseId
          ) ? null : (
            <button
              onClick={() => joinCourse.mutate()}
              className="border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-8"
            >
              Join the course
            </button>
          )}
        </div>
      </div>
      <div className="flex w-full mt-5 gap-10">
        <div className="w-[950px]">
          <h4 className="text-2xl font-semibold">{activeChapter?.name}</h4>
          {activeChapter?.video_file === "" ? (
            <div className="mt-2 w-full h-[530px] rounded-lg bg-gray-100"></div>
          ) : (
            <video className="w-full h-[530px] rounded-lg mt-2" ref={videoRef} controls src={activeChapter?.video_file}></video>
          )}
          <div className="flex mt-4 gap-5">
            <button
              onClick={() => setIsOverview(true)}
              className={`text-xl px-4 py-1 rounded-2xl border border-gray-800 hover:bg-gray-100 hover:font-medium ${
                isOverview
                  ? "shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 font-medium translate-colors"
                  : ""
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setIsOverview(false)}
              className={`text-xl px-4 py-1 rounded-2xl border border-gray-800 hover:bg-gray-100 hover:font-medium ${
                isOverview
                  ? ""
                  : "shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 font-medium translate-colors"
              }`}
            >
              Materials
            </button>
          </div>
          <div className="border rounded-2xl mt-4 p-4">
            <h4 className="text-2xl font-medium">{`${
              isOverview ? "Course Detail" : "Materials"
            }`}</h4>
            <div
              className={`mt-4 w-full min-h-44 ${
                isOverview ? "" : "grid grid-cols-6 content-center gap-2"
              }`}
            >
              {isOverview ? (
                <p className="">{course?.description}</p>
              ) : (
                getAllMaterialInChapter.data?.map((material) => (
                  <MaterialsDetail key={material.id} name={material.file} />
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <h4 className="text-2xl">Chapters</h4>
          {getAllChapterInCourse.data?.map((chapter) => (
            <ChapterSelected
              key={chapter.id}
              name={chapter.name}
              isActive={chapter.id === activeChapter?.id}
              onClick={() => setActiveChapter(chapter)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
