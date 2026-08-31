'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTeamMember(data: {
  name: string
  role: string
  bio?: string
  imageUrl?: string
  order?: number
  isActive?: boolean
}) {
  try {
    const member = await prisma.teamMember.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      }
    })
    
    revalidatePath('/admin/team')
    revalidatePath('/team')
    revalidatePath('/about')
    
    return { success: true, id: member.id }
  } catch (error: any) {
    console.error('Failed to create team member:', error)
    return { success: false, error: error.message }
  }
}

export async function updateTeamMember(id: string, data: any) {
  try {
    await prisma.teamMember.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio || null,
        imageUrl: data.imageUrl || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      }
    })
    
    revalidatePath('/admin/team')
    revalidatePath('/team')
    revalidatePath('/about')
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
