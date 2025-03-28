"use client";
import TeacherLayout from "@/layouts/TeacherLayout";

export default function CourseManagementLayout({
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
      backTo={{ page: "courses", customPath: "/teacher" }}
      navigation={[
        {
          name: "Chapters",
          path: ({ courseID }) => `/teacher/${courseID}`,
        },
        {
          name: "Settings",
          path: ({ courseID }) => `/teacher/${courseID}/settings`,
        },
      ]}
    >
      {children}
    </TeacherLayout>
  );
}
