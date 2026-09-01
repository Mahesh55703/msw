'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address.' }).max(150, 'Email is too long'),
  password: z.string().min(1, { message: 'Password is required.' }).max(200, 'Password is too long'),
})

// In-memory rate limiting for login attempts
interface RateLimitRecord {
  attempts: number
  firstAttemptTime: number
}

const loginRateLimits = new Map<string, RateLimitRecord>()
const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function login(prevState: any, formData: FormData) {
  let ip = 'unknown'
  try {
    const headersList = await headers()
    ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  } catch {
    // Outside Next.js request context (e.g. testing)
  }

  const rawEmail = ((formData.get('email') as string) || '').trim().toLowerCase()
  const rateLimitKey = `${ip}:${rawEmail || 'anon'}`

  // Check rate limit
  const now = Date.now()
  const currentLimit = loginRateLimits.get(rateLimitKey)

  if (currentLimit) {
    if (now - currentLimit.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
      // Reset after window expires
      loginRateLimits.delete(rateLimitKey)
    } else if (currentLimit.attempts >= MAX_LOGIN_ATTEMPTS) {
      return {
        message: 'Too many failed login attempts. Please try again after 15 minutes.',
      }
    }
  }

  const validatedFields = loginSchema.safeParse({
    email: rawEmail,
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
    // Record failed attempt for rate limiting
    const existing = loginRateLimits.get(rateLimitKey)
    if (existing) {
      existing.attempts += 1
    } else {
      loginRateLimits.set(rateLimitKey, { attempts: 1, firstAttemptTime: now })
    }

    return {
      message: 'Invalid email or password.',
    }
  }

  const passwordsMatch = await bcrypt.compare(password, user.password)

  if (!passwordsMatch) {
    // Record failed attempt for rate limiting
    const existing = loginRateLimits.get(rateLimitKey)
    if (existing) {
      existing.attempts += 1
    } else {
      loginRateLimits.set(rateLimitKey, { attempts: 1, firstAttemptTime: now })
    }

    return {
      message: 'Invalid email or password.',
    }
  }

  // Clear failed rate limit on successful authentication
  loginRateLimits.delete(rateLimitKey)

  await createSession(user.id, user.role)
  redirect('/admin/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
