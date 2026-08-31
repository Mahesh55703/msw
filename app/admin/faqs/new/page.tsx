import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import FaqForm from "@/components/admin/faq/FaqForm"

export default async function NewFaqPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect("/admin/login")
  return <FaqForm />
}
