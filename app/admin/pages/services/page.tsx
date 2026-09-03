import { redirect } from 'next/navigation'

export default function ServicesPageRedirect() {
  redirect('/admin/pages?tab=services')
}
