import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KLOZD - Close more. Stress less. | Smart Sales Management",
  description:
    "KLOZD centralise tes leads, automatise tes relances, et transforme ton chaos commercial en machine à signer. Rejoins les 500 premiers utilisateurs.",
  keywords: ["CRM", "leads", "ventes", "pipeline", "automatisation", "IA", "intelligence artificielle", "prospection"],
  authors: [{ name: "KLOZD" }],
  openGraph: {
    title: "KLOZD - Close more. Stress less.",
    description:
      "L'outil de gestion commerciale intelligent pour entrepreneurs.",
    type: "website",
    locale: "fr_FR",
    siteName: "KLOZD",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ee46ac7-1163-4a5d-9fde-4fb8985616d5/id-preview-ade0e719--d2afd57d-4666-4f70-95b5-9aaf91ec3900.lovable.app-1768837653298.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@klozd",
    title: "KLOZD - Close more. Stress less.",
    description: "L'outil de gestion commerciale intelligent pour entrepreneurs.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ee46ac7-1163-4a5d-9fde-4fb8985616d5/id-preview-ade0e719--d2afd57d-4666-4f70-95b5-9aaf91ec3900.lovable.app-1768837653298.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="stylesheet" crossOrigin="" href="/assets/index-D3CRx_8L.css" />
        <style dangerouslySetInnerHTML={{__html: `
          @font-face {
            font-family: 'CameraPlainVariable';
            src: url('/fonts/CameraPlainVariable.woff2') format('woff2');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }
        `}} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {children}
        {process.env.NODE_ENV === 'production' && (
          <Script
            defer
            src="/js/~flock.js"
            data-proxy-url="https://kleed-flow.lovable.app/~api/analytics"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
