'use client'
import MaterialsDetail from "@/app/components/MaterialsDetail";
import {
  Camera,
  ChevronDown,
  Mic,
  TvMinimal,
  TvMinimalPlay,
  Volume2,
} from "lucide-react";
import { useState } from "react";

export default function Stream() {
    const [isRecording , setIsRecording] = useState(false)
  return (
    <div className="mt-6">
      <h4 className="text-2xl font-medium">01 Intro</h4>
      <div className="flex mt-4 gap-6">
        <div className="w-[950px]">
          <div className="w-full h-[535px] bg-gray-200 rounded-2xl"></div>
          <div className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 w-32 ">
            <h4 className="text-2xl font-medium text-center">Materials</h4>
          </div>
          <div
            className={
              "mt-4 w-full grid grid-cols-6 content-center gap-2 border border-gray-800 p-4 rounded-2xl min-h-44"
            }
          >
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
          </div>
        </div>

        {/* recording part */}
        <div className="flex-1">
          <h5 className="text-xl font-medium">Recording</h5>
          <div className="flex mt-4 gap-8">
            <div>
              <button className="w-24 h-24 border border-gray-800 rounded-2xl flex justify-center items-center focus:bg-gray-200 hover:bg-gray-100">
                <TvMinimalPlay size={40} />
              </button>
              <p className="text-center text-sm mt-2">Screen + Cam</p>
            </div>
            <div>
              <button className="w-24 h-24 border border-gray-800 rounded-2xl flex justify-center items-center focus:bg-gray-200 hover:bg-gray-100">
                <TvMinimal size={40} />
              </button>
              <p className="text-center text-sm mt-2">Screen</p>
            </div>
            <div>
              <button className="w-24 h-24 border border-gray-800 rounded-2xl flex justify-center items-center focus:bg-gray-200 hover:bg-gray-100">
                <Camera size={40} />
              </button>
              <p className="text-center text-sm mt-2">Camera</p>
            </div>
          </div>

          {/* detail camera, mic, speaker */}
          <div className="mt-6 space-y-2 text-gray-800">
            <div className="flex justify-between">
              <div className="flex gap-3 w-40">
                <Camera />
                <p className="font-medium">Camera</p>
              </div>
              <button className="flex flex-1 justify-between gap-20 text-gray-400">
                <p>camera</p>
                <ChevronDown />
              </button>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-3 w-40">
                <Mic />
                <p className="font-medium">Input device</p>
              </div>
              <button className="flex flex-1 justify-between gap-20 text-gray-400">
                <p>Microphone</p>
                <ChevronDown />
              </button>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-3 w-40">
                <Volume2 />
                <p className="font-medium">Output device</p>
              </div>
              <button className="flex flex-1 justify-between gap-20 text-gray-400">
                <p>Speaker</p>
                <ChevronDown />
              </button>
            </div>
          </div>
          <button onClick={() => setIsRecording(!isRecording)} className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 flex items-center justify-center gap-3 w-full">
            <div className="rounded-full size-4 bg-gray-800"></div>
            <h4 className="text-xl font-medium text-center">{isRecording ? "Stop Recording":"Start Recording"}</h4>
          </button>
        </div>
      </div>
    </div>
  );
}
