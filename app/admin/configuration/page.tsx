import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { hasPermission, Role } from '@/lib/rbac'
import prisma from '@/lib/prisma'
import ConfigurationForm from './ConfigurationForm'

export const metadata = {
  title: 'Global Configuration | LabourAxis Admin',
}

export default async function ConfigurationPage() {
  const session = await verifySession()
  if (!session.isAuth) redirect('/admin/login')
  
  if (!hasPermission(session.role as Role, 'configuration:manage')) {
    redirect('/admin/dashboard')
  }

  const config = await prisma.siteConfiguration.findUnique({
    where: { id: 'global' },
    include: {
      ogImage: true
    }
  })

  // If no config found, pass empty object (though we seeded it)
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#12372A] mb-2">Global Configuration</h1>
        <p className="text-[#66736D] text-sm">
          Manage LabourAxis business details, contact information, social links, and global SEO defaults.
        </p>
      </div>

      <ConfigurationForm initialData={config || {}} />
    </div>
  )
}
