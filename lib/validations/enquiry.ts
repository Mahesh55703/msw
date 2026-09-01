import { z } from 'zod'

export const publicConsultationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  company: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150, 'Company name is too long'),
  designation: z.string().trim().max(100, 'Designation is too long').optional(),
  phone: z
    .string()
    .trim()
    .min(10, 'Valid phone number with at least 10 digits is required')
    .max(20, 'Phone number is too long'),
  email: z.string().trim().email('Valid email address is required').max(150, 'Email is too long'),
  industry: z.string().trim().min(2, 'Industry is required').max(100, 'Industry is too long'),
  employees: z.string().trim().min(1, 'Employee count is required'),
  contractors: z.string().trim().min(1, 'Contractor count is required'),
  location: z.string().trim().min(2, 'Location is required').max(150, 'Location is too long'),
  preferredContact: z.enum(['Phone', 'WhatsApp', 'Email']).default('Phone'),
  source: z.string().trim().optional(),
  services: z.array(z.string()).optional().default([]),
  message: z.string().trim().min(10, 'Please provide more details (at least 10 characters)').max(3000, 'Message cannot exceed 3000 characters'),
  turnstileToken: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
})

export const manualLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  company: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Valid email address is required'),
  service: z.string().trim().min(2, 'Service is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).default('NEW'),
  assignedToId: z.string().optional(),
  message: z.string().trim().optional(),
  source: z.string().trim().default('Manual Entry'),
})

export const updateStatusSchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']),
  lostReason: z.string().optional(),
  note: z.string().optional(),
})

export const updatePrioritySchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
})

export const assignEnquirySchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
  assignedToId: z.string().nullable().optional(),
})

export const addNoteSchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
  note: z.string().trim().min(2, 'Note cannot be empty').max(2000, 'Note is too long'),
})

export const setFollowUpSchema = z.object({
  enquiryId: z.string().min(1, 'Enquiry ID is required'),
  followUpDate: z.string().nullable().optional(), // ISO string or empty
})

export type PublicConsultationInput = z.infer<typeof publicConsultationSchema>
export type ManualLeadInput = z.infer<typeof manualLeadSchema>
