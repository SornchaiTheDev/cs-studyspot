import { User } from "@/types/auth";
import { ChildrenProps } from "@/types/global-props";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function RoleLayout({ children }: ChildrenProps) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (accessToken === undefined) {
    redirect("/login");
  }

  const userDecoded = jwtDecode<JwtPayload & User>(accessToken);

  if (userDecoded.role !== null) {
    return redirect("/");
  }

  return children;
}

export default RoleLayout;
