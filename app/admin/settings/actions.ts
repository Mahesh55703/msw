'use server'

import prisma from '@/lib/prisma'
import { verifySession } from '@/lib/session'
import bcrypt from 'bcryptjs'

export async function updateSettings(formData: FormData) {
  try {
    const session = await verifySession()
    if (!session.isAuth || !session.userId) {
      return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!email) {
      return { error: 'Email is required' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId as string }
    })

    if (!user) {
      return { error: 'User not found' }
    }

    const updateData: any = {
      name,
      email,
    }

    // Handle password change if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword) {
        return { error: 'Current password is required to change password' }
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return { error: 'Current password is incorrect' }
      }

      if (!newPassword) {
        return { error: 'New password is required' }
      }

      if (newPassword !== confirmPassword) {
        return { error: 'New passwords do not match' }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateData.password = hashedPassword
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUser) {
        return { error: 'Email is already in use' }
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to update settings:', error)
    return { error: 'Failed to update settings' }
  }
}
