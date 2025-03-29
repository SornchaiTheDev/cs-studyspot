"use client";
import { ReactNode } from "react";
import MaterialPreviewCard from "@/components/MaterialPreviewCard";
import { cn } from "@/libs/cn";
import { Camera, Mic, TvMinimal, TvMinimalPlay } from "lucide-react";
import { useRecorder } from "./_hooks/useRecorder";
import { RecordingType } from "@/types/recording-types";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Material } from "@/types/material";
import { Chapter } from "@/types/chapter";
import { api } from "@/libs/api";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/components/Loading";
import LoadingMaterialPreviewCard from "@/components/LoadingMaterialPreviewCard";

const recordingTypes: { name: RecordingType; icon: ReactNode }[] = [
  {
    name: "Screen + Cam",
    icon: <TvMinimalPlay size={40} />,
  },
  {
    name: "Screen",
    icon: <TvMinimal size={40} />,
  },
  {
    name: "Camera",
    icon: <Camera size={40} />,
  },
];

export default function Stream() {
  const { chapterID } = useParams();

  const { data: chapter, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<Chapter>(`/v1/chapters/${chapterID}`);
      return res.data;
    },
  });

  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter", chapterID],
    queryFn: async () => {
      const res = await api.get<{ materials: Material[] }>(
        `/v1/materials/${chapterID}`
      );
      return res.data.materials;
    },
  });
  const {
    selectedType,
    mainScreenRef,
    subScreenRef,
    isRecording,
    elapsedTime,
    cameras,
    microphones,
    handleSelectType,
    handleSelectScreen,
    handleSelectCamera,
    handleSelectMicrophone,
    handleRecording,
  } = useRecorder();

  const isHasScreen =
    selectedType === "Screen + Cam" || selectedType === "Screen";

  return (
    <div className="mt-6">
      <Loading
        isLoading={isChapterLoading}
        fallback={<Skeleton className="h-8 w-20" />}
      >
        <h4 className="text-2xl font-medium">{chapter?.name}</h4>
      </Loading>
      <div className="flex mt-4 gap-6">
        <div className="w-[950px]">
          <div className="relative w-full h-[535px] bg-gray-200 rounded-2xl overflow-hidden">
            <video
              muted
              className="w-full h-full object-cover"
              ref={mainScreenRef}
            ></video>
            <div className="w-32 h-32 rounded-full absolute right-4 bottom-4 overflow-hidden">
              <video
                ref={subScreenRef}
                className="w-full object-cover h-full"
              ></video>
            </div>
          </div>
          <div className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 w-32 ">
            <h4 className="text-2xl font-medium text-center">Materials</h4>
          </div>
          <div
            className={
              "mt-4 w-full grid grid-cols-6 content-center gap-2 border border-gray-800 p-4 rounded-2xl min-h-44"
            }
          >
            {getAllMaterialInChapter.data?.map((material) => (
              <Loading
                key={material.id}
                isLoading={getAllMaterialInChapter.isLoading}
                fallback={<LoadingMaterialPreviewCard />}
              >
                <MaterialPreviewCard name={material.file} />
              </Loading>
            ))}
          </div>
        </div>

        {/* recording part */}
        <div className="flex-1">
          <h5 className="text-xl font-medium">Recording</h5>
          <div className="flex mt-4 gap-8">
            {recordingTypes.map(({ name, icon }) => (
              <div key={name}>
                <button
                  onClick={() => handleSelectType(name)}
                  className={cn(
                    "w-24 h-24 border border-gray-800 rounded-2xl flex justify-center items-center focus:bg-gray-200 hover:bg-gray-100",
                    selectedType === name && "bg-gray-100"
                  )}
                >
                  {icon}
                </button>
                <p className="text-center text-sm mt-2">{name}</p>
              </div>
            ))}
          </div>

          {selectedType !== null && (
            <>
              {/* detail camera, mic, speaker */}
              <div className="mt-6 space-y-2 text-gray-800">
                {isHasScreen && (
                  <div className="flex justify-between">
                    <div className="flex flex-1 gap-3 w-40">
                      <TvMinimal />
                      <p className="font-medium">Screen</p>
                    </div>
                    <button
                      onClick={handleSelectScreen}
                      className="font-bold underline"
                    >
                      Select Screen
                    </button>
                  </div>
                )}

                {selectedType !== "Screen" && (
                  <div className="flex justify-between">
                    <div className="flex flex-1 gap-3 w-40">
                      <Camera />
                      <p className="font-medium">Camera</p>
                    </div>
                    <select
                      className="flex-1"
                      disabled={isRecording}
                      onChange={handleSelectCamera}
                    >
                      <option value="none">Select Camera</option>
                      <option value="off">Off</option>
                      {cameras.map(({ name, id }) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex justify-between">
                  <div className="flex flex-1 gap-3 w-40">
                    <Mic />
                    <p className="font-medium">Input device</p>
                  </div>
                  <select
                    className="flex-1"
                    disabled={isRecording}
                    onChange={handleSelectMicrophone}
                  >
                    <option value="none">Select Microphone</option>
                    <option value="off">Off</option>
                    {microphones.map(({ name, id }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleRecording}
                className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 flex items-center justify-center gap-3 w-full"
              >
                <div
                  className={cn(
                    "rounded-full size-4 bg-gray-800",
                    isRecording && "animate-pulse bg-red-500"
                  )}
                ></div>
                <h4 className="text-xl font-medium text-center">
                  {isRecording ? "Stop Recording" : "Start Recording"}
                  {isRecording && <span className="ml-2">({elapsedTime})</span>}
                </h4>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
