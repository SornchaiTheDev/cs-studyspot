"use client";
import TeacherLayout from "@/layouts/TeacherLayout";

export default function ChaptersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses = {
    course: "Project Manager",
    teacher: "Thirawat Kui",
    chapter: 4,
    student: 12,
    progress: 0,
  };

  return (
    <TeacherLayout
      {...courses}
      backTo={{ page: "chapters", customPath: "../" }}
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
