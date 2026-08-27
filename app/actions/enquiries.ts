'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { EnquiryStatus } from '@prisma/client'

export async function updateEnquiryStatus(formData: FormData) {
  const enquiryId = formData.get('enquiryId') as string
  const status = formData.get('status') as EnquiryStatus

  if (!enquiryId || !status) return

  const oldEnquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } })
  if (!oldEnquiry || oldEnquiry.status === status) return

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      status,
      activities: {
        create: {
          type: 'STATUS_CHANGED',
          note: `Status changed from ${oldEnquiry.status} to ${status}`,
          createdBy: 'Admin'
        }
      }
    }
  })

  revalidatePath(`/admin/enquiries/${enquiryId}`)
  revalidatePath(`/admin/dashboard`)
}

export async function addEnquiryNote(formData: FormData) {
  const enquiryId = formData.get('enquiryId') as string
  const note = formData.get('note') as string

  if (!enquiryId || !note.trim()) return

  await prisma.enquiry.update({
    where: { id: enquiryId },
    data: {
      activities: {
        create: {
          type: 'NOTE_ADDED',
          note: note.trim(),
          createdBy: 'Admin'
        }
      }
    }
  })

  revalidatePath(`/admin/enquiries/${enquiryId}`)
}
