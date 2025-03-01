"use client";
import BackToPage from "../components/BackToPage";
import ChapterSelected from "../components/ChapterSelected";
import MaterialsDetail from "../components/MaterialsDetail";
import { useState } from "react";

interface Props {
  course: string;
  teacher: string;
  chapter: number;
  student: number;
  progress: number;
}

export default function Course() {
  const courses: Props = {
    course: "Project Manager",
    teacher: "Thirawat Kui",
    chapter: 4,
    student: 12,
    progress: 0,
  };

  const [isOverview, setIsOverview] = useState(true);
  // const [currentChapter, setCurrentChapter] = useState(1);

  return (
    <div className="w-screen h-screen p-6 overflow-y-scroll">
      <div className="flex justify-between h-[48px]">
        <BackToPage page="courses" customPath="/courses" />
        <img src="avatar.jpg" className="rounded-full border" />
      </div>
      <div className="w-[950px]">
        <div className="flex justify-between w-full items-end">
          <div className="flex gap-8">
            <div>
              <p className="text-sm">Course</p>
              <h6 className="text-lg font-medium">{courses.course}</h6>
            </div>
            <div>
              <p className="text-sm">Teacher</p>
              <h6 className="text-lg font-medium">{courses.teacher}</h6>
            </div>
            <div>
              <p className="text-sm">Chapter</p>
              <h6 className="text-lg font-medium">{courses.chapter}</h6>
            </div>
            <div>
              <p className="text-sm">Progress</p>
              <h6 className="text-lg font-medium">{courses.progress} %</h6>
            </div>
          </div>
          <button className="border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 rounded-2xl px-6 h-8">
            Join the course
          </button>
        </div>
      </div>
      <div className="flex w-full mt-5 gap-10">
        <div className="w-[950px]">
          <h4 className="text-2xl font-semibold">01: Intro</h4>
          <div className="mt-2 w-full h-[530px] rounded-lg bg-gray-100"></div>
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
                <p className="">
                  {
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla"
                  }
                </p>
              ) : (
                <>
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                  <MaterialsDetail name="01457_Ch10.ppt" />
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <h4 className="text-2xl">Chapters</h4>
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
          <ChapterSelected name="01: Intro" time="1 hrs. 19 min" />
        </div>
      </div>
    </div>
  );
}
