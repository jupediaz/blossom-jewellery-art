import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudioClient from "./StudioClient";

export const metadata = { robots: { index: false, follow: false } };

export default async function StudioPage() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STORE_OWNER")
  ) {
    redirect("/login");
  }
  return <StudioClient />;
}
