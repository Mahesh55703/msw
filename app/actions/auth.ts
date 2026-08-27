'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid email or password.',
    }
  }

  const { email, password } = validatedFields.data

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return {
      message: 'Invalid email or password.',
    }
  }

  const passwordsMatch = await bcrypt.compare(password, user.password)

  if (!passwordsMatch) {
    return {
      message: 'Invalid email or password.',
    }
  }

  await createSession(user.id, user.role)
  redirect('/admin/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
