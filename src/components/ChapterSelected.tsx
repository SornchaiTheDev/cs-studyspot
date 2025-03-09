'use client'
interface Props {
    name: string;
    time: string;
}

export default function ChapterSelected({name, time}: Props) {
  return (
    <>
      <button className="flex w-full justify-between items-center px-2 py-1 border border-gray-800 rounded-lg focus:shadow-[3px_3px_0px_rgb(31,41,55)] hover:bg-gray-100 focus:bg-gray-100">
        <h6 className="text-xl font-medium">{name}</h6>
        <p className="">{time}</p>
      </button>
    </>
  );
}
