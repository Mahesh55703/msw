'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { requirePermission, Role } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { verifySession } from '@/lib/session'

const userSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(150),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),
  isActive: z.boolean().default(true),
})

export async function getUsers() {
  await requirePermission('users:view')
  
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getUser(id: string) {
  await requirePermission('users:view')
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    }
  })
}

export async function createUser(data: any) {
  const session = await requirePermission('users:manage')
  
  const parsed = userSchema.parse(data)
  
  // SUPER_ADMIN check
  if (parsed.role === 'SUPER_ADMIN') {
    await requirePermission('super_admin:manage')
  }

  if (!parsed.password) {
    throw new Error('Password is required for new users')
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 10)

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      password: hashedPassword,
      role: parsed.role,
      isActive: parsed.isActive,
    }
  })

  await prisma.adminAuditLog.create({
    data: {
      action: 'USER_CREATED',
      actorId: session.userId,
      targetId: user.id,
      metadata: { role: user.role, email: user.email },
    }
  })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(id: string, data: any) {
  const session = await requirePermission('users:manage')
  const parsed = userSchema.parse(data)

  const existingUser = await prisma.user.findUnique({ where: { id } })
  if (!existingUser) throw new Error('User not found')

  // Prevent demoting/deactivating last SUPER_ADMIN
  if (existingUser.role === 'SUPER_ADMIN' && (parsed.role !== 'SUPER_ADMIN' || !parsed.isActive)) {
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN', isActive: true } })
    if (superAdminCount <= 1) {
      throw new Error('Cannot modify the last active SUPER_ADMIN')
    }
  }

  // Only SUPER_ADMIN can manage SUPER_ADMINs
  if (existingUser.role === 'SUPER_ADMIN' || parsed.role === 'SUPER_ADMIN') {
    await requirePermission('super_admin:manage')
  }

  const updateData: any = {
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    role: parsed.role,
    isActive: parsed.isActive,
  }

  if (parsed.password) {
    updateData.password = await bcrypt.hash(parsed.password, 10)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData
  })

  await prisma.adminAuditLog.create({
    data: {
      action: 'USER_UPDATED',
      actorId: session.userId,
      targetId: user.id,
      metadata: { role: user.role, isActive: user.isActive },
    }
  })

  revalidatePath('/admin/users')
  return { success: true }
}
