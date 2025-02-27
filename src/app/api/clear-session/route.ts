import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const GET = async () => {
  const cookieStore = await cookies();

  cookieStore.getAll().map(({ name }) => cookieStore.delete(name));

  redirect("/login");
};
