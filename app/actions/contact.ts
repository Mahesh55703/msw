"use server";

import { z } from 'zod';
import { Resend } from "resend";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Simple in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT = 5; // max 5 submissions
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().min(2, "Company name is required"),
  designation: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  industry: z.string().min(2, "Industry is required"),
  employees: z.string().min(1, "Employee count is required"),
  contractors: z.string().min(1, "Contractor count is required"),
  location: z.string().min(2, "Location is required"),
  preferredContact: z.string(),
  source: z.string().optional(),
  services: z.array(z.string()).optional(),
  message: z.string().min(10, "Please provide more details in your message"),
  turnstileToken: z.string().min(1, "Security verification is required"),
});

function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `LA-${year}-${randomStr}`;
}

export async function submitConsultation(formData: FormData) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    
    // Basic Rate Limiting
    if (ip !== 'unknown') {
      const now = Date.now();
      const ipData = rateLimitMap.get(ip);
      
      if (ipData && (now - ipData.timestamp) < RATE_LIMIT_WINDOW_MS) {
        if (ipData.count >= RATE_LIMIT) {
          return { success: false, error: "Too many requests. Please try again later." };
        }
        rateLimitMap.set(ip, { count: ipData.count + 1, timestamp: ipData.timestamp });
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    }

    // Honeypot spam protection check
    const websiteHoneypot = formData.get("website");
    if (websiteHoneypot) {
      console.log("Spam detected via honeypot.");
      return { success: true, message: "Message received successfully." }; // Pretend success
    }

    // Parse and validate via Zod
    const parsed = formSchema.safeParse({
      name: formData.get("name") || "",
      company: formData.get("company") || "",
      designation: formData.get("designation") || undefined,
      phone: formData.get("phone") || "",
      email: formData.get("email") || "",
      industry: formData.get("industry") || "",
      employees: formData.get("employees") || "",
      contractors: formData.get("contractors") || "",
      location: formData.get("location") || "",
      preferredContact: formData.get("preferredContact") || "",
      source: formData.get("source") || undefined,
      services: formData.getAll("services") || [],
      message: formData.get("message") || "",
      turnstileToken: formData.get("cf-turnstile-response") || "dummy_token_if_dev",
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0].message;
      return { success: false, error: firstError };
    }

    const data = parsed.data;

    // Verify Turnstile
    if (process.env.TURNSTILE_SECRET_KEY) {
      const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: data.turnstileToken,
          remoteip: ip !== 'unknown' ? ip : undefined,
        }),
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyData.success) {
        return { success: false, error: "Security verification failed. Please try again." };
      }
    }

    // 1. Create Enquiry in PostgreSQL first
    const referenceNumber = generateReferenceNumber();
    const serviceString = data.services?.join(", ") || "";
    
    // We wrap db operations in a try-catch to not expose DB errors
    let newEnquiry;
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
          source: data.source,
          activities: {
            create: {
              type: "CREATED",
              note: "Enquiry submitted via website contact form.",
              createdBy: "System"
            }
          }
        }
      });
    } catch (dbError) {
      console.error("Database Error:", dbError);
      return { success: false, error: "We couldn't submit your request right now. Please try again or contact us directly." };
    }

    // 2. Send notification email (if configured)
    if (resend && process.env.ADMIN_NOTIFICATION_EMAIL) {
      const htmlContent = `
        <h2>New Consultation Request: ${referenceNumber}</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Designation:</strong> ${data.designation || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Industry:</strong> ${data.industry}</p>
        <p><strong>Employees:</strong> ${data.employees}</p>
        <p><strong>Contract Workers:</strong> ${data.contractors}</p>
        <p><strong>Services Needed:</strong> ${serviceString}</p>
        <p><strong>Source:</strong> ${data.source || 'N/A'}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `;

      try {
        await resend.emails.send({
          from: "LabourAxis <info@labouraxis.com>",
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Lead [${referenceNumber}]: ${data.name} from ${data.company}`,
          html: htmlContent,
          replyTo: data.email,
        });
      } catch (emailError) {
        console.error("Email sending failed, but lead was saved:", emailError);
        // Continue, because the database is the source of truth
      }
    }

    return { success: true, message: "Your request has been submitted successfully. We will contact you soon." };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    // Generic error message for security
    return { success: false, error: "We couldn't submit your request right now. Please try again or contact us directly." };
  }
}
