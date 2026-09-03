'use client'
import { createContext, useContext } from 'react'

const SiteConfigContext = createContext<any>(null)

export function SiteConfigProvider({ config, children }: { config: any, children: React.ReactNode }) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider')
  }
  return context
}
