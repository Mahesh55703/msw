import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config-accessor";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"),
    title: config.seoTitle || "LabourAxis | Industrial HR & Labour Compliance Consultancy",
    description: config.metaDescription || "Practical HR, labour compliance, PF, ESIC and workforce support for factories, MSMEs and workforce-intensive businesses across India.",
    authors: [{ name: config.businessName || "LabourAxis" }],
    creator: config.businessName || "LabourAxis",
    publisher: config.businessName || "LabourAxis",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      url: "/",
      siteName: config.businessName || "LabourAxis",
      locale: "en_IN",
      type: "website",
      images: config.ogImage ? [config.ogImage.url] : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SiteConfigProvider } from "@/components/layout/SiteConfigProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  return (
    <html lang="en" className="scroll-smooth h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <AnalyticsProvider
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        />
        <SiteConfigProvider config={config}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </SiteConfigProvider>
      </body>
    </html>
  );
}
