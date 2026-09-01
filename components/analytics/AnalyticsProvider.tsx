'use client'

import { useEffect, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import {
  initAttributionCapture,
  trackPageView,
} from '@/lib/analytics'

interface AnalyticsProviderProps {
  gaId?: string
  gtmId?: string
}

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    // 1. Initialize first-touch attribution capture
    initAttributionCapture()

    // 2. Track public page view
    if (pathname && !pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
      const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname

      // Prevent duplicate tracking on identical consecutive route updates
      if (lastTrackedPath.current !== fullPath) {
        lastTrackedPath.current = fullPath
        trackPageView(pathname, typeof document !== 'undefined' ? document.title : undefined)
      }
    }
  }, [pathname, searchParams])

  return null
}

export function AnalyticsProvider({ gaId, gtmId }: AnalyticsProviderProps) {
  return (
    <>
      {/* 1. Google Tag Manager Container */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* 2. Direct Google Analytics 4 (gtag.js) if GTM is not used */}
      {!gtmId && gaId && (
        <>
          <Script
            id="ga-gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <Script
            id="ga-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  send_page_view: false // Managed explicitly by SPA route tracker
                });
              `,
            }}
          />
        </>
      )}

      {/* 3. SPA Route Change Listener & First-Touch UTM Tracker */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  )
}
