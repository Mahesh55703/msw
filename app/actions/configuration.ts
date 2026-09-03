'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { hasPermission, Role } from '@/lib/rbac'

const ConfigSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  tagline: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  
  email: z.string().email('Invalid email address').nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressState: z.string().nullable().optional(),
  addressCountry: z.string().nullable().optional(),
  addressDisplay: z.string().nullable().optional(),
  addressFooterDisplay: z.string().nullable().optional(),
  
  linkedin: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  
  seoTitle: z.string().max(60, 'SEO title should be under 60 characters').nullable().optional(),
  metaDescription: z.string().max(160, 'Meta description should be under 160 characters').nullable().optional(),
  ogImageId: z.string().nullable().optional(),
})

export async function updateConfiguration(data: z.infer<typeof ConfigSchema>) {
  try {
    const session = await verifySession()
    if (!session.isAuth) {
      return { success: false, error: 'Unauthorized' }
    }
    
    if (!hasPermission(session.role as Role, 'configuration:manage')) {
      return { success: false, error: 'Unauthorized to manage configuration' }
    }

    const validated = ConfigSchema.safeParse(data)
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message }
    }

    const { ogImageId, ...rest } = validated.data
    
    // Sanitize empty strings to null for optional fields
    const sanitizedData = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [key, value === '' ? null : value])
    )

    // Check media if provided
    if (ogImageId) {
      const media = await prisma.media.findUnique({ where: { id: ogImageId } })
      if (!media) {
        return { success: false, error: 'Invalid OG image selected' }
      }
    }

    await prisma.siteConfiguration.upsert({
      where: { id: 'global' },
      update: {
        ...sanitizedData,
        ogImageId: ogImageId || null,
        updatedById: session.userId,
      },
      create: {
        id: 'global',
        businessName: sanitizedData.businessName as string,
        ...sanitizedData,
        ogImageId: ogImageId || null,
        updatedById: session.userId,
      }
    })

    await prisma.adminAuditLog.create({
      data: {
        action: 'CONFIGURATION_UPDATED',
        actorId: session.userId,
        targetId: null,
        metadata: { changedFields: Object.keys(validated.data) },
      }
    })

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('Failed to update configuration:', error)
    return { success: false, error: 'Internal server error' }
  }
}
