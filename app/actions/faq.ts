'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { faqSchema, FaqInput, faqCategoryEnum } from '@/lib/validations/faq'
import { z } from 'zod'

export async function createFaq(rawData: unknown) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please login to perform this action.' }
    }

    const validatedData = faqSchema.parse(rawData)

    const faq = await prisma.faq.create({
      data: {
        question: validatedData.question,
        answer: validatedData.answer,
        category: validatedData.category,
        published: validatedData.published,
        displayOrder: validatedData.displayOrder,
      },
    })

    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')

    return { success: true, faq }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(', ') }
    }
    return { success: false, error: error.message || 'Failed to create FAQ' }
  }
}

export async function updateFaq(id: string, rawData: unknown) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please login to perform this action.' }
    }

    const partialFaqSchema = faqSchema.partial()
    const validatedData = partialFaqSchema.parse(rawData)

    const faq = await prisma.faq.update({
      where: { id },
      data: validatedData,
    })

    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')

    return { success: true, faq }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(', ') }
    }
    return { success: false, error: error.message || 'Failed to update FAQ' }
  }
}

export async function deleteFaq(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please login to perform this action.' }
    }

    await prisma.faq.delete({
      where: { id },
    })

    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete FAQ' }
  }
}

export async function updateFaqOrder(id: string, newOrder: number) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please login to perform this action.' }
    }

    const safeOrder = Math.max(0, Math.floor(newOrder))
    const faq = await prisma.faq.update({
      where: { id },
      data: { displayOrder: safeOrder },
    })

    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')

    return { success: true, faq }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update display order' }
  }
}

export async function togglePublishFaq(id: string) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized. Please login to perform this action.' }
    }

    const current = await prisma.faq.findUnique({
      where: { id },
      select: { published: true },
    })

    if (!current) {
      return { success: false, error: 'FAQ not found.' }
    }

    const faq = await prisma.faq.update({
      where: { id },
      data: { published: !current.published },
    })

    revalidatePath('/admin/faqs')
    revalidatePath('/resources/faqs')

    return { success: true, published: faq.published }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to toggle publication status' }
  }
}
