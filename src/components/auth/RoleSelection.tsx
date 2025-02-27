"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";

interface RoleButtonProps {
  role: "teacher" | "student";
  icon: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
}

function RoleButton({ role, icon, onClick, isLoading }: RoleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex flex-col items-center justify-center gap-4 px-12 py-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all w-[200px] h-[200px] dark:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4285f4] rounded-full animate-spin" />
      ) : (
        <div className="text-4xl text-gray-700 dark:text-white">{icon}</div>
      )}
      <span className="text-[#757575] dark:text-gray-300 text-2xl font-medium capitalize">
        {isLoading ? "Setting up..." : role}
      </span>
    </button>
  );
}

export default function RoleSelection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "teacher" | "student" | null
  >(null);

  const api = useApi();

  const handleRoleSelect = async (role: "teacher" | "student") => {
    try {
      setIsLoading(true);
      setSelectedRole(role);

      await api.post("/v1/auth/set-role", { role });

      console.log(`Selected role: ${role}`);
      setIsLoading(false);
      router.push("/");
    } catch (error) {
      console.error("Role selection failed:", error);
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 px-4">
      <h1 className="text-4xl font-normal text-black dark:text-white">
        Choose your role
      </h1>
      <div className="flex flex-col sm:flex-row portrait:sm:flex-row gap-8">
        <RoleButton
          role="teacher"
          icon={
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          }
          onClick={() => handleRoleSelect("teacher")}
          isLoading={isLoading && selectedRole === "teacher"}
        />
        <RoleButton
          role="student"
          icon={
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          }
          onClick={() => handleRoleSelect("student")}
          isLoading={isLoading && selectedRole === "student"}
        />
      </div>
    </div>
  );
}

