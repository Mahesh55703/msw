'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createFaq(data: any) {
  try {
    const faq = await prisma.faq.create({ data })
    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')
    return { success: true, faq }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateFaq(id: string, data: any) {
  try {
    const faq = await prisma.faq.update({ where: { id }, data })
    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')
    return { success: true, faq }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteFaq(id: string) {
  try {
    await prisma.faq.delete({ where: { id } })
    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
