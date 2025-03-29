"use client";

import { CheckIcon } from "lucide-react";

interface Props {
  name: string;
  isActive: boolean;
  onClick: () => void;
  isCompleted: boolean;
}

export default function ChapterSelected({
  name,
  isActive,
  onClick,
  isCompleted,
}: Props) {
  return (
    <>
      <button
        onClick={onClick}
        className={`flex w-full gap-2 items-center px-2 py-1 border border-gray-800 rounded-lg hover:bg-gray-100 ${isActive ? `shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100` : ""}`}
      >
        {isCompleted && <CheckIcon size="1rem" className="shrink-0" />}

        <h6 className="text-xl font-medium truncate">{name} alksdjslkdjadlaksjdaljdljdlajdlajlsjdlajdasldjas;jdajdlasjdalsjdalj</h6>
      </button>
    </>
  );
}
