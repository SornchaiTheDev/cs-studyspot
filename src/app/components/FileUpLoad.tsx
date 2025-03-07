"use client";
import { ArrowUpFromLine, Trash } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableItem } from "@/app/components/SortableItem"; // Custom sortable component

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle File Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    let isError = false;
    acceptedFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        isError = true;
      }
    });

    if (isError) {
      setError("File size must be less than 5MB");
      return;
    }

    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  // Handle Drag & Drop Sorting
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = files.findIndex((file) => file.name === active.id);
      const newIndex = files.findIndex((file) => file.name === over.id);
      setFiles((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  // Handle File Removal
  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
  });

  const isFileNotEmpty = (files: File[]) => {
    if (files.length > 0) return true;
    return false;
  }

  return (
    <div className="flex flex-col items-center px-6 py-10 border border-gray-800 rounded-lg cursor-pointer w-full">
      {/* Drop Area */}
      {/* {!isFileNotEmpty(files) && ( */}
      <div
        {...getRootProps()}
        className="w-full text-center p-4 flex flex-col items-center justify-center gap-4"
      >
        <input {...getInputProps()} />
        <ArrowUpFromLine className="text-gray-600" size={24} />
        <p className="text-gray-600 font-medium">
          Choose a file or drag & drop it here
        </p>
        <p className="text-sm text-gray-500">JPG, JPEG, PNG formats, up to 5MB</p>
      </div>
      {/* )} */}

      {/* Drag & Drop File List */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files.map((file) => file.name)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-wrap gap-4">
            {files.map((file) => (
              <SortableItem key={file.name} id={file.name}>
                <div className="relative w-32 h-32">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    className="absolute top-1 right-1 bg-gray-800 text-white p-1 rounded-full hover:bg-red-600"
                    onClick={() => removeFile(file.name)}
                  >
                    <Trash size={16} />
                  </button>
                  <p className="text-xs text-gray-700 mt-2 truncate">{file.name}</p>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

// "use client";
// import { ArrowUpFromLine, Upload } from "lucide-react";
// import { useCallback, useState } from "react";
// import { useDropzone } from "react-dropzone";

// export default function FileUpload() {
//   const [file, setFile] = useState<File[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const onDrop = useCallback((acceptedFiles: File[]) => {
//     let isError = false;
//     acceptedFiles.map((file) => {
//       if (file) {
//         if (file.size > 5 * 1024 * 1024) {
//           isError = true;
//           return;
//         }
//       }
//     });
//     if (isError) {
//       setError("File size must be less than 5MB");
//       return;
//     }
//     setFile((prev) => [...prev, ...acceptedFiles]);
//   }, []);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: {
//       "image/jpeg": [".jpg", ".jpeg"],
//       "image/png": [".png"],
//     },
//   });

//   return (
//     <div className="flex flex-col items-center px-6 py-10 border border-gray-800 rounded-lg cursor-pointer w-full">
//       <div
//         {...getRootProps()}
//         className="w-full text-center p-4 flex flex-col items-center justify-center gap-4"
//       >
//         <input {...getInputProps()} />
//         <ArrowUpFromLine className="text-gray-600" size={24} />
//         <p className="text-gray-600 font-medium">
//           Choose a file or drag & drop it here
//         </p>
//         <p className="text-sm text-gray-500">
//           JPG,JPEG,PNG formats, up to 5mbs
//         </p>
//       </div>

//       <div className="flex">
//         {file.map((item) => (
//           <div className="mt-4 size-40">
//             <img
//               src={URL.createObjectURL(item)}
//               alt="Preview"
//               className="w-32 h-32 object-cover rounded-md"
//             />
//             <p className="text-sm text-gray-700 mt-2 truncate" >{item.name}</p>
//           </div>
//         ))}
//       </div>

//       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//     </div>
//   );
// }

