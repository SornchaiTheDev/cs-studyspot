"use client";
import BackToPage from "@/components/BackToPage";
import ChapterSelected from "@/components/ChapterSelected";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types/course";
import { Material } from "@/types/material";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/providers/SessionProvider";
import { Chapter } from "@/types/chapter";
import { useParams } from "next/navigation";
import { api } from "@/libs/api";
import Loading from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingMaterialPreviewCard from "@/components/LoadingMaterialPreviewCard";
import { Frown } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/types/progress";

export default function CoursePage() {
  const [isOverview, setIsOverview] = useState(true);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const { courseID } = useParams();
  const { user } = useSession();
  const queryClient = useQueryClient();

  const videoRef = useRef<HTMLVideoElement>(null);

  const checkIsEnrolled = useQuery({
    queryKey: ["isenrolled", courseID],
    queryFn: async () => {
      const res = await api.get<{ isEnrolled: boolean }>(
        `/v1/attend/courses/${courseID}`,
      );
      return res.data;
    },
  });

  const updataEnrolled = useMutation({
    mutationFn: async () => {
      await api.post(`/v1/attend/enroll`, { course_id: courseID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-course"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["progress-course"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["isenrolled", courseID],
      });
    },
  });

  const getAllChapterInCourse = useQuery({
    queryKey: ["chapters", courseID],
    queryFn: async () => {
      const res = await api.get<{ chapters: Chapter[] | null }>(
        `/v1/chapters/course/${courseID}`,
      );
      return res.data.chapters;
    },
  });

  const getChapterProgressesInCourse = useQuery({
    queryKey: ["chapters-progress", courseID],
    queryFn: async () => {
      const res = await api.get<{ progresses: Progress[] | null }>(
        `/v1/progress/courses/${courseID}/chapters`,
      );
      return res.data.progresses;
    },
  });

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", activeChapter],
    queryFn: async () => {
      const res = await api.get<{ materials: Material[] }>(
        `/v1/materials/${activeChapter?.id}`,
      );
      return res.data.materials;
    },
  });

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["user-course", courseID],
    queryFn: async () => {
      const res = await api.get<Course>(`/v1/courses/${courseID}`);
      return res.data;
    },
  });

  const getProgress = useQuery({
    queryKey: ["progress-course", courseID],
    queryFn: async () => {
      const res = await api.get<{ percentage: number }>(
        `/v1/progress/${courseID}`,
      );
      return res.data;
    },
  });

  const createProgress = useMutation({
    mutationFn: async () => {
      await api.post<number>("/v1/progress/", {
        userId: user.id,
        courseId: courseID,
        chapterId: activeChapter?.id,
      });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async () => {
      await api.patch(`/v1/progress`, {
        userId: user.id,
        chapterId: activeChapter?.id,
        status: true,
      });
    },
  });

  useEffect(() => {
    if (
      getAllChapterInCourse.data === undefined ||
      getAllChapterInCourse.data === null
    )
      return;
    else if (getAllChapterInCourse.data.length === 0) return;
    setActiveChapter(getAllChapterInCourse.data[0]);
  }, [getAllChapterInCourse.data]);

  useEffect(() => {
    const video = videoRef.current;
    console.log("called");
    console.log(video);

    if (video) {
      // Event when the video starts playing
      const handleVideoStart = async () => {
        console.log("video started");
        await createProgress.mutateAsync();
      };

      // Event when the video ends
      const handleVideoEnd = async () => {
        console.log("video ended");
        await updateProgress.mutateAsync();
        queryClient.invalidateQueries({
          queryKey: ["user-course"],
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["progress-course"],
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: ["chapters-progress"],
          refetchType: "all",
        });
      };

      // Add event listeners
      video.addEventListener("play", handleVideoStart);
      video.addEventListener("ended", handleVideoEnd);

      // Cleanup event listeners when component unmounts
      return () => {
        video.removeEventListener("play", handleVideoStart);
        video.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [createProgress, updataEnrolled, updateProgress, queryClient]);

  return (
    <div className="w-screen h-screen p-6 overflow-y-scroll">
      <div className="flex justify-between h-[48px]">
        <BackToPage page="courses" customPath="/courses" />
        <div className="relative size-12 rounded-full border">
          <Image
            src={user.profileImage}
            className="rounded-full border"
            alt={"user profile image"}
            fill
          />
        </div>
      </div>
      <div className="w-[950px]">
        <div className="flex justify-between w-full items-end">
          <div className="flex gap-8">
            <div>
              <p className="text-sm">Course</p>
              <Loading
                isLoading={isCourseLoading}
                fallback={<Skeleton className="h-7 w-24" />}
              >
                <h6 className="text-lg font-medium">{course?.name}</h6>
              </Loading>
            </div>
            <div>
              <p className="text-sm">Teacher</p>
              <Loading
                isLoading={isCourseLoading}
                fallback={<Skeleton className="h-7 w-24" />}
              >
                <h6 className="text-lg font-medium">{course?.teacher}</h6>
              </Loading>
            </div>
            <div>
              <p className="text-sm">Chapter</p>
              <Loading
                isLoading={isCourseLoading}
                fallback={<Skeleton className="h-7 w-11" />}
              >
                <h6 className="text-lg font-medium">{course?.chapterCount}</h6>
              </Loading>
            </div>
            {checkIsEnrolled.data?.isEnrolled && !checkIsEnrolled.isLoading && (
              <div>
                <p className="text-sm">Progress</p>
                <Loading
                  isLoading={getProgress.isLoading}
                  fallback={<Skeleton className="h-7 w-11" />}
                >
                  <h6 className="text-lg font-medium">
                    {getProgress.data?.percentage ?? 0} %
                  </h6>
                </Loading>
              </div>
            )}
          </div>

          {checkIsEnrolled.data?.isEnrolled ||
          checkIsEnrolled.isLoading ? null : (
            <button
              onClick={() => {
                updataEnrolled.mutate();
                queryClient.invalidateQueries({
                  queryKey: ["user-courses"],
                  refetchType: "all",
                });
              }}
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
          {!checkIsEnrolled.data?.isEnrolled ||
          activeChapter === null ||
          (checkIsEnrolled.data?.isEnrolled === true &&
            activeChapter?.video_file === "") ? (
            <div className="flex flex-col gap-3 items-center justify-center mt-2 w-full h-[530px] rounded-lg bg-gray-100 text-lg text-gray-800">
              <Frown size={36} />
              There is no video right now
            </div>
          ) : (
            <video
              key={activeChapter?.video_file}
              className="w-full h-[530px] rounded-lg mt-2"
              ref={videoRef}
              controls
              src={activeChapter?.video_file}
            ></video>
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
                <Loading
                  isLoading={isCourseLoading}
                  fallback={<Skeleton className="w-full h-6" />}
                >
                  <p className="">{course?.description}</p>
                </Loading>
              ) : (
                <Loading
                  isLoading={
                    getAllMaterialInChapter.isLoading ||
                    checkIsEnrolled.isLoading
                  }
                  fallback={Array.from({ length: 6 })
                    .fill("")
                    .map((_, i) => (
                      <LoadingMaterialPreviewCard key={i} />
                    ))}
                >
                  {checkIsEnrolled.data?.isEnrolled &&
                    getAllMaterialInChapter.data?.map((material) => (
                      <MaterialPreviewCard
                        name={material.file}
                        key={material.id}
                      />
                    ))}
                </Loading>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 max-w-[400px]">
          <h4 className="text-2xl">Chapters</h4>
          <Loading
            isLoading={getAllChapterInCourse.isLoading}
            fallback={Array.from({ length: 5 })
              .fill("")
              .map((_, i) => (
                <Skeleton key={i} className="w-full h-10" />
              ))}
          >
            {getAllChapterInCourse.data?.map((chapter) => (
              <ChapterSelected
                isCompleted={
                  getChapterProgressesInCourse.data?.some(
                    (p) => p.chapterId === chapter.id && p.status,
                  ) ?? false
                }
                key={chapter.id}
                name={chapter.name}
                isActive={chapter.id === activeChapter?.id}
                onClick={() => setActiveChapter(chapter)}
              />
            ))}
          </Loading>
        </div>
      </div>
    </div>
  );
}
