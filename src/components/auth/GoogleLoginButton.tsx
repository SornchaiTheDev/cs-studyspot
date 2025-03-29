"use client";

import { useState } from "react";
import { redirect } from "next/navigation";

export default function GoogleLoginButton() {
  const [isLoading, setIsloading] = useState(false);
  const handleClick = async () => {
    setIsloading(true);
    redirect(window.env.API_URL + "/v1/auth/sign-in/google");
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-4 px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all w-full h-[72px] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4285f4] rounded-full animate-spin" />
      ) : (
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-8 h-8"
        />
      )}
      <span className="text-[#757575] text-xl lg:text-2xl font-medium">
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </span>
    </button>
  );
}
