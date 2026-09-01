'use server'

import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'
import { publicConsultationSchema } from '@/lib/validations/enquiry'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

function generateReferenceNumber(): string {
  const year = new Date().getFullYear()
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase()
  return `LA-${year}-${randomStr}`
}

export async function submitConsultation(formData: FormData) {
  try {
    let ip = 'unknown'
    try {
      const headersList = await headers()
      ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    } catch {
      // Running outside Next.js request context (e.g. testing / script)
    }

    // Rate Limiting
    if (ip !== 'unknown') {
      const now = Date.now()
      const ipData = rateLimitMap.get(ip)

      if (ipData && now - ipData.timestamp < RATE_LIMIT_WINDOW_MS) {
        if (ipData.count >= RATE_LIMIT) {
          return { success: false, error: 'Too many requests. Please try again in a few minutes.' }
        }
        rateLimitMap.set(ip, { count: ipData.count + 1, timestamp: ipData.timestamp })
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now })
      }
    }

    // Honeypot spam check
    const websiteHoneypot = formData.get('website')
    if (websiteHoneypot) {
      return { success: true, message: 'Message received successfully.' }
    }

    // Parse and validate using Zod
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

    // Server-side Turnstile verification
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!data.turnstileToken) {
        return { success: false, error: 'Security verification failed. Please complete the captcha.' }
      }

      try {
        const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken,
            remoteip: ip !== 'unknown' ? ip : undefined,
          }),
        })
        const verifyData = await verifyRes.json()

        if (!verifyData.success) {
          return { success: false, error: 'Security verification failed. Please refresh and try again.' }
        }
      } catch (turnstileErr) {
        console.error('Turnstile verification network error:', turnstileErr)
        // If Cloudflare service is down, don't silently block genuine users unless secret key is explicitly strict
      }
    }

    // Build unique reference number
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

    const serviceString = data.services && data.services.length > 0 ? data.services.join(', ') : 'General Enquiry'

    // Build structured source & attribution details JSON
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

    // Create Enquiry in PostgreSQL
    let newEnquiry
    try {
      newEnquiry = await prisma.enquiry.create({
        data: {
          referenceNumber,
          name: data.name,
          company: data.company,
          designation: data.designation,
          email: data.email,
          phone: data.phone,
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
    } catch (dbError: any) {
      console.error('Database error while saving enquiry:', dbError)
      return {
        success: false,
        error: "We couldn't submit your request right now. Please reach out to us directly at info@labouraxis.com",
      }
    }

    // Send Admin Notification Email via Resend
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
        await resend.emails.send({
          from: 'LabourAxis CRM <info@labouraxis.com>',
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Lead [${referenceNumber}]: ${data.name} from ${data.company}`,
          html: htmlContent,
          replyTo: data.email,
        })
      } catch (emailError) {
        console.error('Resend email failed, but enquiry is saved in DB:', emailError)
      }
    }

    return {
      success: true,
      referenceNumber,
      message: `Thank you! Your consultation request (${referenceNumber}) has been received. Our compliance team will contact you shortly.`,
    }
  } catch (err: any) {
    console.error('Unhandled error in submitConsultation:', err)
    return {
      success: false,
      error: "We couldn't submit your request right now. Please try again or contact us directly.",
    }
  }
}
