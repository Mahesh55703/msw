import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth h-full">
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <head>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </head>
      )}
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
