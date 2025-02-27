"use client";
import { Afacad } from "next/font/google";
import BackToPage from "../components/BackToPage";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const afacad = Afacad({
  variable: "--font-afacad",
  subsets: ["latin"],
});

interface Props {
  course: string;
  teacher: string;
  chapter: number;
  student: number;
  progress: number;
}

export default function CourseManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courses: Props = {
    course: "Project Manager",
    teacher: "Thirawat Kui",
    chapter: 4,
    student: 12,
    progress: 0,
  };

  const [isChapter, setIsChapter] = useState(true);
  const router = useRouter();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${afacad.className} antialiased`}
      >
        <div className="w-screen h-screen p-6 overflow-y-scroll">
          <div className="flex justify-between h-[48px]">
            <BackToPage page="courses" />
            <img src="/avatar.jpg" className="rounded-full border" />
          </div>
          <div className="flex gap-8 w-[950px]">
            <div>
              <p className="text-sm">Course</p>
              <h6 className="text-lg font-medium">{courses.course}</h6>
            </div>
            <div>
              <p className="text-sm">Teacher</p>
              <h6 className="text-lg font-medium">{courses.teacher}</h6>
            </div>
            <div>
              <p className="text-sm">Chapter</p>
              <h6 className="text-lg font-medium">{courses.chapter}</h6>
            </div>
            <div>
              <p className="text-sm">Student</p>
              <h6 className="text-lg font-medium">{courses.student}</h6>
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => {
                setIsChapter(true);
                router.push("/course-management");
              }}
              className={`px-1 flex flex-col items-center ${
                isChapter ? "font-medium" : "text-gray-400"
              }`}
            >
              <p>Chapters</p>
              {isChapter ? (
                <div className="w-10 h-0.5 bg-gray-800 rounded-full mt-1"></div>
              ) : (
                <></>
              )}
            </button>
            <button
              onClick={() => {
                setIsChapter(false);
                router.push("/course-management/settings");
              }}
              className={`px-1 flex flex-col items-center ${
                isChapter ? "text-gray-400" : "font-medium"
              }`}
            >
              <p>Settings</p>
              {isChapter ? (
                <></>
              ) : (
                <div className="w-10 h-0.5 bg-gray-800 rounded-full mt-1"></div>
              )}
            </button>
          </div>
          <div className="w-full h-0.5 bg-gray-100"></div>
          {children}
        </div>
      </body>
    </html>
  );
}
