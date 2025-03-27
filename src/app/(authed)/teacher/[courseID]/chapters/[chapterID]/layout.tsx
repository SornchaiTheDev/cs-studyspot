"use client";
import TeacherLayout from "@/layouts/TeacherLayout";
import { useParams } from "next/navigation";

export default function ChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const courses = {
  //   name: "Project Manager",
  //   teacher: "Thirawat Kui",
  //   chapter: 4,
  //   student: 12,
  //   progress: 0,
  // };
  const {courseID, chapterID} = useParams();

  return (
    <TeacherLayout
      // {...courses}
      backTo={{ page: "chapters", customPath: `/teacher/${courseID}` }}
      navigation={[
        {
          name: "Chapter",
          path: ({ courseID, chapterID }) =>
            `/teacher/${courseID}/chapters/${chapterID}`,
        },
        {
          name: "Settings",
          path: ({ courseID, chapterID }) =>
            `/teacher/${courseID}/chapters/${chapterID}/settings`,
        },
      ]}
    >
      {children}
    </TeacherLayout>
  );
}
