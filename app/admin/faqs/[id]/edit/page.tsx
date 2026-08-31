import prisma from "@/lib/prisma"
import { verifySession } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import FaqForm from "@/components/admin/faq/FaqForm"

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession()
  if (!session.isAuth) redirect("/admin/login")
  
  const resolvedParams = await params
  const faq = await prisma.faq.findUnique({ where: { id: resolvedParams.id } })
  if (!faq) notFound()
    
  return <FaqForm initialData={faq} />
}
