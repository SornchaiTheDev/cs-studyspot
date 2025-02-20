"use client";

export default function GoogleLoginButton() {
  return (
    <button className="flex items-center justify-center gap-4 px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow w-full h-[72px]">
      <img
        src="https://www.google.com/favicon.ico"
        alt="Google"
        className="w-8 h-8"
      />
      <span className="text-[#757575] text-xl lg:text-2xl font-medium">Sign in with Google</span>
    </button>
  );
} 