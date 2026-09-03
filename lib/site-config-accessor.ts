import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export const getSiteConfig = unstable_cache(
  async () => {
    let dbConfig = null
    try {
      dbConfig = await prisma.siteConfiguration.findUnique({
        where: { id: 'global' },
        include: {
          ogImage: true
        }
      })
    } catch (err) {
      console.error('Error fetching site config:', err)
    }

    const config = dbConfig || {
      businessName: "LabourAxis",
      email: "info@labouraxis.com",
      phone: "+91 94250 55703",
      whatsapp: "+919425055703",
      addressCity: "Indore",
      addressState: "Madhya Pradesh",
      addressCountry: "India",
      addressDisplay: "Based in Indore, Madhya Pradesh. Serving clients remotely across India, with on-site support where applicable.",
      addressFooterDisplay: "Based in Indore, MP • Serving clients across India",
      linkedin: "https://www.linkedin.com/in/lavish-chouhan-8b29b4361/",
      seoTitle: "LabourAxis | Operations & Statutory CRM",
      metaDescription: "LabourAxis provides comprehensive Labour Law Compliance, Payroll Management, and HR Operations solutions.",
      ogImage: null
    }

    return {
      ...config,
      // Legacy structure for drop-in replacement
      name: config.businessName,
      contact: {
        email: config.email,
        phone: config.phone,
        whatsapp: config.whatsapp,
        address: {
          city: config.addressCity,
          state: config.addressState,
          country: config.addressCountry,
          display: config.addressDisplay,
          footerDisplay: config.addressFooterDisplay
        }
      },
      social: {
        linkedin: config.linkedin,
      }
    }
  },
  ['global-site-config'],
  { tags: ['site-config'] }
)
