"use client";
import { useSession } from "@/providers/SessionProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function TestPage() {
  const { user } = useSession();
  const router = useRouter();
  return (
    <div>
      <h1 className="text-xl text-center mt-4">
        This page is behind authentication wall. You are save here little kid :D
      </h1>
      <button onClick={() => router.push("/test2")}>Go to Test2</button>
      <pre className="bg-slate-200 p-4 mt-10">
        {JSON.stringify(user, null, 2)}
      </pre>
      <div className="flex justify-center mt-10">
        <Image
          src={user.profileImage}
          className="rounded-full"
          alt="Profile Image"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
}
