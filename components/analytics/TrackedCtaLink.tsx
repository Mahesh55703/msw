'use client'

import React from 'react'
import Link from 'next/link'
import {
  trackConsultationCta,
  trackPhoneClick,
  trackWhatsAppClick,
  trackEmailClick,
  trackChecklistDownload,
  trackCareerApplication,
} from '@/lib/analytics'

export interface TrackedCtaLinkProps extends React.ComponentProps<typeof Link> {
  ctaType?: 'consultation' | 'phone' | 'whatsapp' | 'email' | 'checklist' | 'career'
  ctaLocation?: string
  ctaLabel?: string
  pageType?: string
  contentId?: string
  contentSlug?: string
  fileType?: string
  jobId?: string
  jobTitle?: string
  department?: string
  applicationMethod?: string
}

export function TrackedCtaLink({
  children,
  ctaType = 'consultation',
  ctaLocation = 'general',
  ctaLabel = 'CTA Link',
  pageType,
  contentId,
  contentSlug,
  fileType = 'pdf',
  jobId,
  jobTitle,
  department,
  applicationMethod = 'email',
  onClick,
  ...props
}: TrackedCtaLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (ctaType === 'consultation') {
        trackConsultationCta(ctaLocation, ctaLabel, pageType)
      } else if (ctaType === 'phone') {
        trackPhoneClick(ctaLocation, pageType)
      } else if (ctaType === 'whatsapp') {
        trackWhatsAppClick(ctaLocation, pageType)
      } else if (ctaType === 'email') {
        trackEmailClick(ctaLocation, pageType)
      } else if (ctaType === 'checklist' && contentId && contentSlug) {
        trackChecklistDownload(contentId, contentSlug, fileType)
      } else if (ctaType === 'career' && jobId && jobTitle) {
        trackCareerApplication(jobId, jobTitle, department, applicationMethod)
      }
    } catch (err) {
      console.warn('[Analytics] Failed to track CTA click:', err)
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}

export interface TrackedAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  ctaType?: 'phone' | 'whatsapp' | 'email' | 'checklist' | 'career'
  ctaLocation?: string
  pageType?: string
  contentId?: string
  contentSlug?: string
  fileType?: string
  jobId?: string
  jobTitle?: string
  department?: string
  applicationMethod?: string
}

export function TrackedAnchor({
  children,
  ctaType = 'email',
  ctaLocation = 'general',
  pageType,
  contentId,
  contentSlug,
  fileType = 'pdf',
  jobId,
  jobTitle,
  department,
  applicationMethod = 'email',
  onClick,
  ...props
}: TrackedAnchorProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      if (ctaType === 'phone') {
        trackPhoneClick(ctaLocation, pageType)
      } else if (ctaType === 'whatsapp') {
        trackWhatsAppClick(ctaLocation, pageType)
      } else if (ctaType === 'email') {
        trackEmailClick(ctaLocation, pageType)
      } else if (ctaType === 'checklist' && contentId && contentSlug) {
        trackChecklistDownload(contentId, contentSlug, fileType)
      } else if (ctaType === 'career' && jobId && jobTitle) {
        trackCareerApplication(jobId, jobTitle, department, applicationMethod)
      }
    } catch (err) {
      console.warn('[Analytics] Failed to track anchor click:', err)
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <a onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
