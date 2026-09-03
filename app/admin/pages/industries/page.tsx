import { redirect } from 'next/navigation'

export default function IndustriesPageRedirect() {
  redirect('/admin/pages?tab=industries')
}
