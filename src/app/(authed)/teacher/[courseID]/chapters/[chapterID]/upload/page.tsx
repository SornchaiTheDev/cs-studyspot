"use client"
import MaterialsDetail from "@/components/MaterialsDetail";
import { Material } from "@/types/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";

export default function Upload() {
  // const router = useRouter();
  // const { chapterID } = useParams();
  // const chapterID = "0195cee8-ab77-7c59-90ca-2c3f5c2b5f7b";
  const {chapterID} = useParams();
  
  const getAllMaterialInChapter = useQuery({
    queryKey: ["material-chapter"],
    queryFn: async () => {
      const res = await axios.get<{ materials: Material[] }>(
        window.env.API_URL + `/v1/materials/${chapterID}`
      );
      return res.data.materials;
    },
  });
  return (
    <>
      <h4 className="mt-6 text-2xl font-medium">01 Intro</h4>
      <div className="flex mt-4 gap-6">
        <div className="w-[950px]">
          <div className="w-full h-[535px] bg-gray-200 rounded-2xl text-center"></div>
          <div className="mt-6 text-xl px-4 py-1 rounded-2xl border border-gray-800 shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100 w-32 ">
            <h4 className="text-2xl font-medium text-center">Materials</h4>
          </div>
          <div
            className={
              "mt-4 w-full grid grid-cols-6 content-center gap-2 border border-gray-800 p-4 rounded-2xl min-h-44"
            }
          >
            {getAllMaterialInChapter.data?.map((material) => <MaterialsDetail key={material.id} name={material.file}/>)}
          </div>
        </div>
      </div>
    </>
  );
}
