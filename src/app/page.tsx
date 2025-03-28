import { User } from "@/types/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function MainPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (accessToken === undefined) {
    redirect("/login");
  }

  const userDecoded = jwtDecode<JwtPayload & User>(accessToken);

  const timeInSeconds = new Date().getTime() / 1000;

  if (userDecoded.exp! < timeInSeconds) {
    redirect("/api/clear-session");
  }

  const user: User = {
    id: userDecoded.id,
    name: userDecoded.name,
    email: userDecoded.email,
    profileImage: userDecoded.profileImage,
    role: userDecoded.role,
  };

  if (user.role === "student") {
    redirect("/courses");
  }

  if (user.role === "teacher") {
    redirect("/teacher");
  }

  return "OH NO";
}
