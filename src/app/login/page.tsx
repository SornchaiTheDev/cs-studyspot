"use client";

import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  // helper function to get animation delay based on sequence and offset
  const getAnimationDelay = (
    index: number,
    sequence: number[],
    offset: number = 0,
  ) => {
    const position = sequence.indexOf(index);
    return position !== -1 ? `${position * 0.1 + offset}s` : "0s";
  };

  // CS sequences
  const cSequence = [37, 36, 35, 34, 45, 56, 67, 78, 89, 100, 101, 102, 103];
  const sSequence = [
    42, 41, 40, 39, 50, 61, 72, 73, 74, 75, 86, 97, 97, 108, 107, 106, 105,
  ];

  // calculate S sequence delay
  const sSequenceDelay = cSequence.length * 0.1 + 0.5;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900 overflow-auto transition-colors">
      <ThemeToggle />
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center py-8 lg:py-0 lg:pl-32 lg:pr-20">
        <div className="flex justify-center w-full max-w-[598px] px-4 mb-8">
          <h1 className="text-3xl font-normal text-black dark:text-white">
            CS StudySpot
          </h1>
        </div>
        <div className="w-full max-w-[598px] px-4">
          <GoogleLoginButton />
        </div>
      </div>
      <div className="w-full lg:w-1/2 h-[400px] lg:h-screen flex items-center justify-center p-4 mt-[120px] lg:mt-0">
        <div className="grid grid-cols-11 gap-2 md:gap-3 lg:gap-4 w-full max-w-[550px] aspect-[11/13] [perspective:1000px]">
          {[...Array(11 * 13)].map((_, i) => {
            const isC = cSequence.includes(i);
            const isS = sSequence.includes(i);
            return (
              <div
                key={i}
                className={`w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full ${
                  isC || isS
                    ? "dark:animate-flipDark animate-flip"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                style={{
                  animationDelay: isC
                    ? getAnimationDelay(i, cSequence)
                    : isS
                      ? getAnimationDelay(i, sSequence, sSequenceDelay)
                      : "0s",
                  transformStyle: "preserve-3d",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

