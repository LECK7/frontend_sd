import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {
  const token = cookies().get("token");
  if (!token) {
    redirect("/login");
  }
  redirect("/menu");
}
