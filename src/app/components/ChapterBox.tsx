export default function ChapterBox() {
  return (
    <div className="w-80 h-52 border border-gray-800 rounded-2xl">
      <img src="/cover.avif" className="object-cover rounded-t-2xl w-full h-40"/>
      <div className="flex h-12 justify-between items-center py-2 px-2">
        <h6 className="text-md font-medium">01: Intro</h6>
        <button className="border rounded-2xl px-6 border-gray-800 text-sm">
            View
        </button>
      </div>
    </div>
  );
}
