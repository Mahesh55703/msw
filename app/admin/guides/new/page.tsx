import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import CmsForm from "@/components/admin/cms/CmsForm";

export default async function NewPage() {
  const session = await verifySession();
  if (!session.isAuth) redirect("/admin/login");

  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  return <CmsForm users={users} category="guides" />;
}
