'use client'
interface Props {
    name: string;
    isActive: boolean;
    onClick: () => void;
}

export default function ChapterSelected({name, isActive, onClick}: Props) {
  return (
    <>
      <button onClick={onClick} className={`flex w-full justify-between items-center px-2 py-1 border border-gray-800 rounded-lg hover:bg-gray-100 ${isActive ? `shadow-[3px_3px_0px_rgb(31,41,55)] bg-gray-100`: ""}`}>
        <h6 className="text-xl font-medium">{name}</h6>
      </button>
    </>
  );
}
