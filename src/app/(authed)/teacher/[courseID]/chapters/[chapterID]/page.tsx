"use client";
// import BackToPage from "@/app/components/BackToPage";
import MaterialsDetail from "@/components/MaterialsDetail";
import { Chapter } from "@/types/chapter";
import { Material } from "@/types/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Upload, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";

// interface Props {
//   course: string;
//   teacher: string;
//   chapter: number;
//   student: number;
//   progress: number;
// }

export default function CourseID() {
  // const courses: Props = {
  //   course: "Project Manager",
  //   teacher: "Thirawat Kui",
  //   chapter: 4,
  //   student: 12,
  //   progress: 0,
  // };
  const router = useRouter();
  const { chapterID } = useParams();
  // const chapterID = "0195ce13-b160-790d-8702-e4f34543c9c8"
  // const chapterID = "0195ce13-b160-790d-8702-e4f34543c9c8"

  const { data: chapter } = useQuery({
    queryKey: ["chapter", chapterID],
    queryFn: async () => {
      const res = await axios.get<Chapter>(
        window.env.API_URL + `/v1/chapters/${chapterID}`
      );
      return res.data;
    },
  });

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", chapterID],
    queryFn: async () => {
      const res = await axios.get<{ materials: Material[] }>(
        window.env.API_URL + `/v1/materials/${chapterID}`
      );
      return res.data.materials;
    },
  });

  return (
    <>
      {/* detail in this page */}
      <div className="mt-6">
        <h4 className="text-2xl font-medium">{chapter?.name}</h4>
        {chapter?.video_file === "" ? (
          <>
            <h5 className="mt-6 text-lg">Choose Method</h5>
            <div className="flex gap-8 mt-6 items-center">
              <button
                onClick={() => router.push(`${chapterID}/stream`)}
                className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] gap-1 hover:bg-gray-200"
              >
                <Video />
                <p className="text-lg">Record</p>
              </button>
              <p>or</p>
              <button
                onClick={() => router.push(`${chapterID}/upload`)}
                className="flex flex-col items-center justify-center border border-gray-800 w-28 h-24 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] hover:bg-gray-200"
              >
                <Upload />
                <p className="text-lg">Upload</p>
              </button>
            </div>
          </>
        ) : (
          <video className="w-[950px] h-[530px] rounded-lg mt-6" controls src={chapter?.video_file}></video>
        )}
        <button className="mt-10 border border-gray-800 px-5 h-10 rounded-2xl shadow-[4px_4px_0px_rgb(31,41,55)] bg-gray-200">
          <p className="text-lg">Materials</p>
        </button>
        <div className="mt-6 w-[950px] border border-gray-800 min-h-44 rounded-2xl grid grid-cols-6 content-center gap-2 p-4">
          {getAllMaterialInChapter.data?.map((material) => (
            <MaterialsDetail key={material.id} name={material.file} />
          ))}
          {/* <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" />
          <MaterialsDetail name="01457_Ch10.ppt" /> */}
        </div>
      </div>
    </>
  );
}
