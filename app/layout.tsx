import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.labouraxis.com"),
  title: "LabourAxis | Industrial HR & Labour Compliance Consultancy",
  description: "Practical HR, labour compliance, PF, ESIC and workforce support for factories, MSMEs and workforce-intensive businesses across India.",
  authors: [{ name: "LabourAxis" }],
  creator: "LabourAxis",
  publisher: "LabourAxis",
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
    siteName: "LabourAxis",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <AnalyticsProvider
          gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
