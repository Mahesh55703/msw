'use server'

import { headers } from 'next/headers'
import { getSiteConfig } from '@/lib/site-config-accessor'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'
import { publicConsultationSchema } from '@/lib/validations/enquiry'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * In-memory rate limiter — FIRST-PASS fast protection for same-instance repeated abuse.
 * NOTE: This does NOT persist across Vercel serverless instances.
 * Production deduplication is enforced via PostgreSQL (see duplicate detection below).
 */
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Cleanup stale entries to prevent unbounded memory growth in long-running
 * processes (local dev, Docker). Serverless instances recycle naturally.
 */
function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [key, val] of rateLimitMap.entries()) {
    if (now - val.timestamp >= RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key)
    }
  }
}

function generateReferenceNumber(): string {
  const year = new Date().getFullYear()
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `LA-${year}-${randomStr}`
}

/**
 * Extracts a reliable client IP address.
 *
 * On Vercel, `x-real-ip` is injected by the platform and cannot be spoofed
 * by the client. `x-forwarded-for` may contain multiple IPs (client, proxies)
 * and its leftmost value can be spoofed. We take `x-real-ip` first.
 */
function extractClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  // Vercel platform-injected real IP — cannot be spoofed by client
  const xRealIp = headersList.get('x-real-ip')
  if (xRealIp) {
    // Strip port if present (e.g., "1.2.3.4:5678" → "1.2.3.4")
    return xRealIp.split(':')[0].trim()
  }

  // x-forwarded-for: "clientIp, proxy1, proxy2" — take only the first (leftmost)
  const xForwardedFor = headersList.get('x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim()
    return firstIp.split(':')[0].trim()
  }

  return 'unknown'
}

export async function submitConsultation(formData: FormData) {
  try {
    // ----------------------------------------------------------------
    // STEP 1: Extract client IP (must come before any early returns)
    // ----------------------------------------------------------------
    let ip = 'unknown'
    try {
      const headersList = await headers()
      ip = extractClientIp(headersList)
    } catch {
      // Running outside Next.js request context (e.g., tests / scripts)
    }

    // ----------------------------------------------------------------
    // STEP 2: Honeypot — must be checked first (fastest rejection)
    // ----------------------------------------------------------------
    const websiteHoneypot = formData.get('website')
    if (websiteHoneypot) {
      // Return decoy success — do NOT reveal bot detection
      // No DB write, no email, no analytics conversion
      return { success: true, message: 'Message received successfully.' }
    }

    // ----------------------------------------------------------------
    // STEP 3: In-Memory Rate Limiting (fast first-pass for same instance)
    // ----------------------------------------------------------------
    if (ip !== 'unknown') {
      const now = Date.now()

      // Periodic cleanup to prevent memory growth in long-running processes
      if (rateLimitMap.size > 500) {
        cleanupRateLimitMap()
      }

      const ipData = rateLimitMap.get(ip)
      if (ipData && now - ipData.timestamp < RATE_LIMIT_WINDOW_MS) {
        if (ipData.count >= RATE_LIMIT) {
          return {
            success: false,
            error: 'Too many requests. Please try again in a few minutes.',
          }
        }
        rateLimitMap.set(ip, { count: ipData.count + 1, timestamp: ipData.timestamp })
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
      }
    }

    // ----------------------------------------------------------------
    // STEP 4: Zod Server-Side Validation (all fields, types, lengths)
    // ----------------------------------------------------------------
    const rawServices = formData.getAll('services') as string[]
    const parsed = publicConsultationSchema.safeParse({
      name: formData.get('name') || '',
      company: formData.get('company') || '',
      designation: (formData.get('designation') as string) || undefined,
      phone: formData.get('phone') || '',
      email: formData.get('email') || '',
      industry: formData.get('industry') || '',
      employees: formData.get('employees') || '',
      contractors: formData.get('contractors') || '',
      location: formData.get('location') || '',
      preferredContact: formData.get('preferredContact') || 'Phone',
      source: (formData.get('source') as string) || 'Website',
      services: rawServices.length > 0 ? rawServices : [],
      message: formData.get('message') || '',
      turnstileToken:
        (formData.get('cf-turnstile-response') as string) ||
        (formData.get('turnstileToken') as string) ||
        '',
      utm_source: (formData.get('utm_source') as string) || undefined,
      utm_medium: (formData.get('utm_medium') as string) || undefined,
      utm_campaign: (formData.get('utm_campaign') as string) || undefined,
      utm_term: (formData.get('utm_term') as string) || undefined,
      utm_content: (formData.get('utm_content') as string) || undefined,
      referrer: (formData.get('referrer') as string) || undefined,
      landingPage: (formData.get('landingPage') as string) || undefined,
    })

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.'
      return { success: false, error: firstError }
    }

    const data = parsed.data

    // ----------------------------------------------------------------
    // STEP 5: Server-Side Turnstile Verification — FAIL-CLOSED
    //
    // If TURNSTILE_SECRET_KEY is configured:
    //   - A valid token is REQUIRED
    //   - Cloudflare outage / network failure → REJECT (fail-closed)
    //   - Invalid / expired / reused token → REJECT
    //   - Missing token → REJECT
    //
    // If TURNSTILE_SECRET_KEY is NOT configured (local dev without key):
    //   - Verification is skipped entirely
    //   - Never silently bypass in production — always set the secret key
    // ----------------------------------------------------------------
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!data.turnstileToken || data.turnstileToken.trim() === '') {
        return {
          success: false,
          error: 'Please complete the security verification and try again.',
        }
      }

      let turnstileVerified = false

      try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken.trim(),
            remoteip: ip !== 'unknown' ? ip : undefined,
          }),
          signal: AbortSignal.timeout(8000), // 8-second timeout
        })

        if (!verifyRes.ok) {
          // Non-2xx HTTP from Cloudflare — treat as verification failure
          console.error('[Security] Turnstile siteverify returned HTTP', verifyRes.status)
          return {
            success: false,
            error: 'Please complete the security verification and try again.',
          }
        }

        const verifyData = (await verifyRes.json()) as {
          success: boolean
          'error-codes'?: string[]
          hostname?: string
          action?: string
          cdata?: string
        }

        if (verifyData.success) {
          turnstileVerified = true
        } else {
          // Log error codes for monitoring (no PII)
          console.warn('[Security] Turnstile verification failed, error-codes:', verifyData['error-codes'])
          return {
            success: false,
            error: 'Please complete the security verification and try again.',
          }
        }
      } catch (turnstileErr) {
        // FAIL-CLOSED: Cloudflare unavailable, timeout, or network error
        // Do NOT continue — reject the submission
        console.error('[Security] Turnstile siteverify unreachable:', (turnstileErr as Error).message)
        return {
          success: false,
          error: 'Security verification is temporarily unavailable. Please try again shortly.',
        }
      }

      // This guard should never be reached given the logic above, but
      // provides an explicit safety net against logic errors.
      if (!turnstileVerified) {
        return {
          success: false,
          error: 'Please complete the security verification and try again.',
        }
      }
    }

    // ----------------------------------------------------------------
    // STEP 6: PostgreSQL-Backed Duplicate Submission Detection
    //
    // Prevents double-click duplicate submissions and bot replay attacks.
    // Checks for existing enquiry with same email AND phone within 5 minutes.
    //
    // Why 5 minutes?
    //   - Covers accidental double-clicks and slow retry loops
    //   - Legitimate clients can resubmit after the window expires
    //   - Does not prevent legitimate clients submitting days later
    //
    // Works correctly across all serverless instances (shared PostgreSQL).
    // ----------------------------------------------------------------
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingDuplicate = await prisma.enquiry.findFirst({
      where: {
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        createdAt: { gte: fiveMinutesAgo },
      },
      select: { id: true, referenceNumber: true },
    })

    if (existingDuplicate) {
      // Return decoy success with existing reference number
      // Prevents revealing the duplicate check to bots / accidental double-submitters
      console.info('[Security] Duplicate submission detected within 5-minute window, returning existing ref')
      return {
        success: true,
        referenceNumber: existingDuplicate.referenceNumber,
        message: `Thank you! Your consultation request (${existingDuplicate.referenceNumber}) has been received. Our compliance team will contact you shortly.`,
      }
    }

    // ----------------------------------------------------------------
    // STEP 7: Database-Level Rate Limiting (cross-instance protection)
    //
    // Checks how many successful submissions came from this IP in the
    // last 15 minutes, using the existing PostgreSQL DB.
    // This is the production-safe counterpart to the in-memory limiter.
    // ----------------------------------------------------------------
    if (ip !== 'unknown') {
      const recentSubmissionCount = await prisma.enquiry.count({
        where: {
          sourceDetails: { contains: `"submittedIp":"${ip}"` },
          createdAt: { gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MS) },
        },
      })

      if (recentSubmissionCount >= RATE_LIMIT) {
        console.warn('[Security] DB-level rate limit exceeded for IP:', ip)
        return {
          success: false,
          error: 'Too many requests from this network. Please try again in a few minutes.',
        }
      }
    }

    // ----------------------------------------------------------------
    // STEP 8: Build Reference Number + Data
    // ----------------------------------------------------------------
    let referenceNumber = generateReferenceNumber()
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 5) {
      const existing = await prisma.enquiry.findUnique({ where: { referenceNumber } })
      if (!existing) {
        isUnique = true
      } else {
        referenceNumber = generateReferenceNumber()
        attempts++
      }
    }

    const serviceString =
      data.services && data.services.length > 0 ? data.services.join(', ') : 'General Enquiry'

    // Build structured source & attribution details JSON
    // IP stored in sourceDetails for admin CRM context only — not sent to analytics
    const sourceDetailsObj = {
      utm_source: data.utm_source || null,
      utm_medium: data.utm_medium || null,
      utm_campaign: data.utm_campaign || null,
      utm_term: data.utm_term || null,
      utm_content: data.utm_content || null,
      referrer: data.referrer || null,
      landingPage: data.landingPage || null,
      submittedIp: ip !== 'unknown' ? ip : null,
      submittedAt: new Date().toISOString(),
    }

    // ----------------------------------------------------------------
    // STEP 9: Create Enquiry in PostgreSQL
    // ----------------------------------------------------------------
    let newEnquiry
    try {
      newEnquiry = await prisma.enquiry.create({
        data: {
          referenceNumber,
          name: data.name,
          company: data.company,
          designation: data.designation,
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          location: data.location,
          industry: data.industry,
          employeeCount: data.employees,
          contractorCount: data.contractors,
          service: serviceString,
          message: data.message,
          preferredContactMethod: data.preferredContact,
          source: data.source || 'Website',
          sourceDetails: JSON.stringify(sourceDetailsObj),
          status: 'NEW',
          priority: 'MEDIUM',
          activities: {
            create: {
              type: 'CREATED',
              note: `Enquiry submitted via website contact form. Services: ${serviceString}`,
              createdBy: 'Website Form',
            },
          },
        },
      })
    } catch (dbError) {
      console.error('[DB] Error while saving enquiry:', (dbError as Error).message)
      return {
        success: false,
        error:
          `We couldn't submit your request right now. Please reach out to us directly at ${(await getSiteConfig()).contact.email}`,
      }
    }

    // ----------------------------------------------------------------
    // STEP 10: Send Admin Notification Email via Resend
    //
    // Email is sent AFTER successful DB insert.
    // Email failure does NOT roll back the lead or report failure to visitor.
    // ----------------------------------------------------------------
    if (resend && process.env.ADMIN_NOTIFICATION_EMAIL) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #202522;">
          <div style="background-color: #12372A; color: #FFFFFF; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">New Consultation Request: ${referenceNumber}</h2>
            <p style="margin: 5px 0 0 0; color: #A2B3AA; font-size: 13px;">Submitted on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          <div style="background-color: #FFFFFF; padding: 24px; border: 1px solid #D9E1DC; border-top: none; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #66736D; width: 140px;"><strong>Client Name:</strong></td><td style="padding: 8px 0; font-weight: bold;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Company:</strong></td><td style="padding: 8px 0; font-weight: bold;">${data.company}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Designation:</strong></td><td style="padding: 8px 0;">${data.designation || 'N/A'}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #1F7A5C;">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Phone:</strong></td><td style="padding: 8px 0;"><a href="tel:${data.phone}" style="color: #1F7A5C;">${data.phone}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Location:</strong></td><td style="padding: 8px 0;">${data.location}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Industry:</strong></td><td style="padding: 8px 0;">${data.industry}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Workforce:</strong></td><td style="padding: 8px 0;">${data.employees} employees | ${data.contractors} contract workers</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Services:</strong></td><td style="padding: 8px 0; font-weight: bold; color: #12372A;">${serviceString}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Preferred Channel:</strong></td><td style="padding: 8px 0;">${data.preferredContact}</td></tr>
              <tr><td style="padding: 8px 0; color: #66736D;"><strong>Source:</strong></td><td style="padding: 8px 0;">${data.source || 'Website'}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background-color: #F7F4EC; border-radius: 6px; border: 1px solid #D9E1DC;">
              <strong style="color: #12372A; font-size: 13px;">Client Message:</strong>
              <p style="margin: 8px 0 0 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${data.message}</p>
            </div>
            <div style="margin-top: 24px; text-align: center;">
              <a href="https://www.labouraxis.com/admin/enquiries/${newEnquiry.id}" style="display: inline-block; background-color: #1F7A5C; color: #FFFFFF; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px;">
                Open in CRM
              </a>
            </div>
          </div>
        </div>
      `

      try {
        const fromAddress = process.env.RESEND_FROM_EMAIL || 'LabourAxis <onboarding@resend.dev>'
        const { data: resendData, error: resendError } = await resend.emails.send({
          from: fromAddress,
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Lead [${referenceNumber}]: ${data.name} from ${data.company}`,
          html: htmlContent,
          replyTo: data.email,
        })

        if (resendError) {
          console.error('[Email] Resend API error:', resendError.name, resendError.message)
        } else {
          console.log('[Email] Notification sent successfully. Message ID:', resendData?.id)
        }
      } catch (emailError) {
        // Email failure does NOT affect success response — lead is already saved
        console.error('[Email] Resend network/system failure:', (emailError as Error).message)
      }
    }

    return {
      success: true,
      referenceNumber,
      message: `Thank you! Your consultation request (${referenceNumber}) has been received. Our compliance team will contact you shortly.`,
    }
  } catch (err) {
    console.error('[Server] Unhandled error in submitConsultation:', (err as Error).message)
    return {
      success: false,
      error: "We couldn't submit your request right now. Please try again or contact us directly.",
    }
  }
}
