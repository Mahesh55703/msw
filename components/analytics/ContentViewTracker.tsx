'use client'

import { useEffect, useRef } from 'react'
import {
  trackArticleView,
  trackGuideView,
} from '@/lib/analytics'

interface ContentViewTrackerProps {
  type: 'article' | 'guide' | 'checklist' | 'update' | 'news'
  contentId: string
  slug: string
  category?: string
  isPreview?: boolean
}

export function ContentViewTracker({
  type,
  contentId,
  slug,
  category = 'updates',
  isPreview = false,
}: ContentViewTrackerProps) {
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    // Strictly prevent tracking admin previews and draft previews
    if (isPreview || hasTrackedRef.current) {
      return
    }

    hasTrackedRef.current = true

    if (type === 'guide') {
      trackGuideView(contentId, slug)
    } else if (type === 'article' || type === 'update' || type === 'news') {
      trackArticleView(contentId, slug, category)
    }
  }, [type, contentId, slug, category, isPreview])

  return null
}
